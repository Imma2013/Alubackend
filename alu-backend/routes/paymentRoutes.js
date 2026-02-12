const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { User } = require('../config/db');
const clerkAuth = require('../middleware/clerkAuth');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Credit pack amounts for one-time purchase
const CREDIT_PACK = {
  bonusImages: 50,
  bonusShorts: 20,
  bonusLongVids: 10,
};

/**
 * POST /create-checkout-session
 * Creates a Stripe Checkout Session.
 * Body: { userId, priceId, mode }
 *   mode: 'subscription' (Pro monthly) or 'payment' (one-time credit pack)
 */
router.post('/create-checkout-session', clerkAuth, async (req, res) => {
  const userId = req.auth.sub;
  const { priceId, mode } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: 'Missing priceId' });
  }

  const checkoutMode = mode === 'payment' ? 'payment' : 'subscription';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: checkoutMode,
      success_url: `${process.env.FRONTEND_URL || 'https://alu-teal-pi.vercel.app'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://alu-teal-pi.vercel.app'}`,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        purchaseType: checkoutMode,
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /webhook
 * Handles Stripe webhooks to fulfill orders/subscriptions.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const purchaseType = session.metadata?.purchaseType || session.mode;

      console.log(`Payment successful for user ${userId}, type: ${purchaseType}`);

      if (purchaseType === 'subscription') {
        // Pro subscription — mark user as Pro
        await User.findOneAndUpdate(
          { userId },
          { isPro: true, subscriptionId: session.subscription, stripeCustomerId: session.customer },
          { upsert: true }
        );
        console.log(`User ${userId} upgraded to Pro`);
      } else {
        // One-time credit pack — add bonus credits
        await User.findOneAndUpdate(
          { userId },
          {
            $inc: {
              bonusImages: CREDIT_PACK.bonusImages,
              bonusShorts: CREDIT_PACK.bonusShorts,
              bonusLongVids: CREDIT_PACK.bonusLongVids,
            },
            stripeCustomerId: session.customer,
          },
          { upsert: true }
        );
        console.log(`User ${userId} received credit pack: +${CREDIT_PACK.bonusImages} images, +${CREDIT_PACK.bonusShorts} shorts, +${CREDIT_PACK.bonusLongVids} videos`);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      // Subscription cancelled — downgrade from Pro
      const subscription = event.data.object;
      const customer = subscription.customer;
      const user = await User.findOne({ stripeCustomerId: customer });
      if (user) {
        user.isPro = false;
        user.subscriptionId = undefined;
        await user.save();
        console.log(`User ${user.userId} downgraded from Pro (subscription cancelled)`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
});

module.exports = router;
