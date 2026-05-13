import { createClient } from 'npm:@supabase/supabase-js@2';
import OpenAI from 'npm:openai';
import { corsHeaders } from './_shared/cors.ts';
import {
  ITINERARY_PROMPT_VERSION_EDGE,
  buildItineraryPromptEdge,
  type ItineraryRequestPayload,
} from './_shared/itineraryPrompt.ts';
import { aiItineraryScenarioSchema } from './_shared/itinerarySchema.ts';
import { type AiTier, maxAiScenariosForTier } from './_shared/limits.ts';

type TripConstraints = {
  pace?: 'relaxed' | 'balanced' | 'packed';
  budget_per_person_cents?: number;
  has_children?: boolean;
  preferences?: string;
  must_dos?: string[];
  no_gos?: string[];
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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

  let body: { tripId?: string; locale?: string; membersCount?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonResponse({ error: 'Invalid JSON', code: 'bad_request' }, 400);
  }

  const tripId = body.tripId;
  if (!tripId || typeof tripId !== 'string') {
    return jsonResponse({ error: 'tripId required', code: 'bad_request' }, 400);
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

  const maxScenarios = maxAiScenariosForTier(tier);

  const { count: aiCount, error: cntErr } = await admin
    .from('itineraries')
    .select('id', { count: 'exact', head: true })
    .eq('trip_id', tripId)
    .eq('generated_by_ai', true)
    .is('deleted_at', null);

  if (cntErr) {
    return jsonResponse({ error: 'Quota check failed', code: 'unknown' }, 500);
  }

  if ((aiCount ?? 0) >= maxScenarios) {
    return jsonResponse({ error: 'Quota exceeded', code: 'quota_exceeded', tier }, 429);
  }

  const { data: trip, error: tripErr } = await admin
    .from('trips')
    .select('destination_text, start_date, end_date, currency, constraints')
    .eq('id', tripId)
    .maybeSingle();

  if (tripErr || !trip) {
    return jsonResponse({ error: 'Trip not found', code: 'bad_request' }, 404);
  }

  let membersCount = typeof body.membersCount === 'number' ? body.membersCount : 0;
  if (membersCount <= 0) {
    const { count: mc } = await admin
      .from('trip_members')
      .select('user_id', { count: 'exact', head: true })
      .eq('trip_id', tripId);
    membersCount = Math.max(1, mc ?? 1);
  }

  const constraints = trip.constraints as TripConstraints | null;
  const interests =
    constraints?.preferences && constraints.preferences.trim().length > 0
      ? [constraints.preferences.trim()]
      : undefined;

  const requestPayload: ItineraryRequestPayload = {
    destination: trip.destination_text,
    startDate: trip.start_date,
    endDate: trip.end_date,
    groupSize: membersCount,
    pace: constraints?.pace,
    budget:
      typeof constraints?.budget_per_person_cents === 'number'
        ? Math.round(constraints.budget_per_person_cents / 100)
        : undefined,
    currency: trip.currency ?? undefined,
    interests,
    has_children: constraints?.has_children,
    must_dos: constraints?.must_dos?.length ? constraints.must_dos : undefined,
    no_gos: constraints?.no_gos?.length ? constraints.no_gos : undefined,
  };

  const prompt = buildItineraryPromptEdge(requestPayload, body.locale);

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
            'You are a professional travel planner. Provide detailed, realistic, and well-structured travel itineraries in JSON format.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const durationMs = Math.round(performance.now() - t0);
    const raw = completion.choices[0]?.message?.content;
    if (!raw || typeof raw !== 'string') {
      return jsonResponse({ error: 'Empty model response', code: 'openai_parse' }, 502);
    }

    const parsed = aiItineraryScenarioSchema.parse(JSON.parse(raw));

    await admin.from('ai_generation_logs').insert({
      user_id: user.id,
      trip_id: tripId,
      kind: 'scenario',
      prompt_tokens: completion.usage?.prompt_tokens ?? null,
      completion_tokens: completion.usage?.completion_tokens ?? null,
      total_tokens: completion.usage?.total_tokens ?? null,
      duration_ms: durationMs,
    });

    return jsonResponse({
      itinerary: parsed,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens,
        duration_ms: durationMs,
        prompt_version: ITINERARY_PROMPT_VERSION_EDGE,
      },
      tier,
      max_scenarios: maxScenarios,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status =
      msg.includes('429') || msg.includes('rate')
        ? 'openai_rate_limit'
        : msg.includes('401') || msg.includes('403')
          ? 'openai_auth'
          : 'unknown';
    return jsonResponse({ error: msg, code: status }, 502);
  }
});
