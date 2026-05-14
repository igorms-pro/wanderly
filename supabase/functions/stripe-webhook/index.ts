import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.4.0';
import { corsHeaders } from './_shared/cors.ts';

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleCheckoutCompleted(
  admin: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.metadata?.supabase_user_id;
  if (!userId || typeof userId !== 'string') return;
  if (session.mode !== 'subscription') return;

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription && typeof session.subscription === 'object'
        ? (session.subscription as Stripe.Subscription).id
        : null;
  if (!subscriptionId) return;

  const customerId =
    typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? null);

  const { error } = await admin
    .from('profiles')
    .update({
      ai_tier: 'premium',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    })
    .eq('id', userId);

  if (error) throw error;
}

async function handleSubscriptionDeleted(
  admin: ReturnType<typeof createClient>,
  sub: Stripe.Subscription,
): Promise<void> {
  const subId = sub.id;
  const { error } = await admin
    .from('profiles')
    .update({ ai_tier: 'free', stripe_subscription_id: null })
    .eq('stripe_subscription_id', subId);

  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!webhookSecret || !stripeSecret || !supabaseUrl || !serviceKey) {
    return jsonResponse({ error: 'Server misconfigured' }, 500);
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature', { status: 400, headers: corsHeaders });
  }

  const rawBody = await req.text();
  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-11-20.acacia' });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return new Response('Invalid signature', { status: 400, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: seen } = await admin
    .from('stripe_webhook_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle();
  if (seen?.id) {
    return jsonResponse({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(admin, event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(admin, event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
    const { error: insErr } = await admin.from('stripe_webhook_events').insert({ id: event.id });
    if (insErr && (insErr as { code?: string }).code !== '23505') throw insErr;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'handler_error';
    return jsonResponse({ error: msg }, 500);
  }

  return jsonResponse({ received: true });
});
