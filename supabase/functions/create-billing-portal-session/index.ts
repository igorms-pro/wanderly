import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.4.0';
import { corsHeaders } from './_shared/cors.ts';

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function absoluteUrl(siteBase: string, path: string): string {
  const base = siteBase.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const secret = Deno.env.get('STRIPE_SECRET_KEY');
  const siteUrl = Deno.env.get('SITE_URL');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!secret || !siteUrl || !supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse({ error: 'Server misconfigured' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const supabaseUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(supabaseUrl, serviceKey);

  const {
    data: { user },
    error: userErr,
  } = await supabaseUser.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const { data: profile, error: profileErr } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileErr || !profile) {
    return jsonResponse({ error: 'Profile not found' }, 400);
  }

  const customerId = (profile as { stripe_customer_id: string | null }).stripe_customer_id;
  if (!customerId) {
    return jsonResponse({ error: 'No billing customer' }, 400);
  }

  const stripe = new Stripe(secret, { apiVersion: '2024-11-20.acacia' });
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: absoluteUrl(siteUrl, '/account'),
  });

  if (!session.url) {
    return jsonResponse({ error: 'No portal URL' }, 500);
  }

  return jsonResponse({ url: session.url });
});
