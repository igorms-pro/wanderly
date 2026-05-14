import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.4.0';
import { corsHeaders } from './_shared/cors.ts';

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function sanitizeRelativePath(raw: string | undefined, fallback: string): string {
  const v = (typeof raw === 'string' && raw.trim() ? raw.trim() : fallback).trim();
  if (!v.startsWith('/') || v.includes('://') || v.length > 512) {
    throw new Error('invalid_path');
  }
  return v;
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
  const priceId = Deno.env.get('STRIPE_PRICE_ID');
  const siteUrl = Deno.env.get('SITE_URL');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!secret || !priceId || !siteUrl || !supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse({ error: 'Server misconfigured' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let body: { successPath?: string; cancelPath?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  let successPath: string;
  let cancelPath: string;
  try {
    successPath = sanitizeRelativePath(body.successPath, '/account?checkout=success');
    cancelPath = sanitizeRelativePath(body.cancelPath, '/account?checkout=cancelled');
  } catch {
    return jsonResponse({ error: 'Invalid redirect paths' }, 400);
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
    .select('email, stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileErr || !profile) {
    return jsonResponse({ error: 'Profile not found' }, 400);
  }

  const stripe = new Stripe(secret, { apiVersion: '2024-11-20.acacia' });
  const row = profile as { email: string; stripe_customer_id: string | null };

  let customerId = row.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: row.email || user.email || undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    const { error: upErr } = await admin
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id);
    if (upErr) {
      return jsonResponse({ error: 'Could not save Stripe customer' }, 500);
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: absoluteUrl(siteUrl, successPath),
    cancel_url: absoluteUrl(siteUrl, cancelPath),
    metadata: { supabase_user_id: user.id },
    subscription_data: { metadata: { supabase_user_id: user.id } },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return jsonResponse({ error: 'No checkout URL' }, 500);
  }

  return jsonResponse({ url: session.url });
});
