// routes/stripeWebhook.js
const express = require('express');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const Subscription = require('../models/Subscription');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

const router = express.Router();

router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const subscriptionId = session.subscription;

      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const tierId = subscription.items.data[0].price.nickname || 'unknown';

        const start = new Date(subscription.current_period_start * 1000);
        const end = new Date(subscription.current_period_end * 1000);

        await Subscription.create({
          userId,
          tierId,
          status: 'active',
          stripeSubscriptionId: subscriptionId,
          startedAt: start,
          expiresAt: end
        });

        console.log('✅ Subscription saved for user:', userId);
      } catch (err) {
        console.error('❌ Failed to save subscription:', err);
      }
    }

    res.status(200).send();
  }
);

module.exports = router;
