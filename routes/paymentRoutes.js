const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { User } = require('../config/db');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /create-checkout-session
 * Creates a Stripe Checkout Session for a subscription or one-time payment.
 * Body: { userId, priceId }
 */
router.post('/create-checkout-session', async (req, res) => {
  const { userId, priceId } = req.body;

  if (!userId || !priceId) {
    return res.status(400).json({ error: 'Missing userId or priceId' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Change to 'payment' for one-time
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      client_reference_id: userId,
      metadata: {
        userId: userId
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
 * Note: This requires the raw body, so middleware in server.js must handle it.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.client_reference_id;
      
      // Update User to Pro / Add Credits
      console.log(`💰 Payment successful for user ${userId}`);
      
      // TODO: Update User Schema logic here
      // await User.findOneAndUpdate({ userId }, { isPro: true });
      
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
});

module.exports = router;
