import { createClient } from 'npm:@supabase/supabase-js@2';
import OpenAI from 'npm:openai';
import { corsHeaders } from './_shared/cors.ts';
import { buildActivitySuggestionsPromptEdge } from './_shared/itineraryPrompt.ts';
import { parseSuggestionsPayload } from './_shared/itinerarySchema.ts';
import { type AiTier, maxSuggestionsPerMonthForTier } from './_shared/limits.ts';

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function startOfUtcMonthIso(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed', code: 'method_not_allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const openaiKey = Deno.env.get('OPENAI_API_KEY');

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse({ error: 'Server misconfigured', code: 'openai_config' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized', code: 'unauthorized' }, 401);
  }

  const supabaseUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await supabaseUser.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ error: 'Unauthorized', code: 'unauthorized' }, 401);
  }

  let body: {
    tripId?: string;
    destination?: string;
    date?: string;
    existingActivities?: string[];
    interests?: string[];
    locale?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonResponse({ error: 'Invalid JSON', code: 'bad_request' }, 400);
  }

  const tripId = body.tripId;
  const date = body.date;
  if (!tripId || !date) {
    return jsonResponse({ error: 'tripId and date required', code: 'bad_request' }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: member, error: memErr } = await admin
    .from('trip_members')
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (memErr || !member) {
    return jsonResponse({ error: 'Forbidden', code: 'forbidden_ai' }, 403);
  }

  const role = (member as { role: string }).role;
  if (!['owner', 'editor', 'moderator'].includes(role)) {
    return jsonResponse({ error: 'Forbidden', code: 'forbidden_ai' }, 403);
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('ai_tier')
    .eq('id', user.id)
    .maybeSingle();

  const tier = (
    (profile as { ai_tier?: string } | null)?.ai_tier === 'premium' ? 'premium' : 'free'
  ) as AiTier;

  const maxSuggest = maxSuggestionsPerMonthForTier(tier);

  const monthStart = startOfUtcMonthIso();
  const { count: usedSuggest, error: suggErr } = await admin
    .from('ai_generation_logs')
    .select('id', { count: 'exact', head: true })
    .eq('trip_id', tripId)
    .eq('kind', 'suggestions')
    .gte('created_at', monthStart);

  if (suggErr) {
    return jsonResponse({ error: 'Quota check failed', code: 'unknown' }, 500);
  }

  if ((usedSuggest ?? 0) >= maxSuggest) {
    return jsonResponse(
      { error: 'Suggestions quota exceeded', code: 'suggestions_quota_exceeded', tier },
      429,
    );
  }

  let destination = typeof body.destination === 'string' ? body.destination.trim() : '';
  if (!destination) {
    const { data: tripRow } = await admin
      .from('trips')
      .select('destination_text')
      .eq('id', tripId)
      .maybeSingle();
    destination =
      (tripRow as { destination_text?: string } | null)?.destination_text?.trim() || 'Trip';
  }

  const prompt = buildActivitySuggestionsPromptEdge({
    destination,
    date,
    existingActivities: Array.isArray(body.existingActivities) ? body.existingActivities : [],
    interests: body.interests,
    locale: body.locale,
  });

  if (!openaiKey) {
    return jsonResponse({ error: 'OpenAI not configured', code: 'openai_config' }, 500);
  }

  const openai = new OpenAI({ apiKey: openaiKey });
  const t0 = performance.now();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional travel planner. Suggest concise, high-quality activities as JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const durationMs = Math.round(performance.now() - t0);
    const raw = completion.choices[0]?.message?.content;
    if (!raw || typeof raw !== 'string') {
      return jsonResponse({ error: 'Empty model response', code: 'openai_parse' }, 502);
    }

    const suggestions = parseSuggestionsPayload(raw);

    await admin.from('ai_generation_logs').insert({
      user_id: user.id,
      trip_id: tripId,
      kind: 'suggestions',
      prompt_tokens: completion.usage?.prompt_tokens ?? null,
      completion_tokens: completion.usage?.completion_tokens ?? null,
      total_tokens: completion.usage?.total_tokens ?? null,
      duration_ms: durationMs,
    });

    return jsonResponse({
      suggestions,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens,
        duration_ms: durationMs,
      },
      tier,
      max_suggestions_month: maxSuggest,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonResponse({ error: msg, code: 'unknown' }, 502);
  }
});
