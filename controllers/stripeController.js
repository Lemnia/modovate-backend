// stripeController.js
const Stripe = require('stripe');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Dummy price IDs for test plans
const PRICE_IDS = {
  sims_basic: 'price_1TestSimsBasic',
  gta_plus: 'price_1TestGtaPlus',
  bundle_ultimate: 'price_1TestBundleUltimate'
};

// Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  const { priceId, userId } = req.body;

  if (!PRICE_IDS[priceId]) {
    return res.status(400).json({ error: 'Invalid price ID' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: PRICE_IDS[priceId],
          quantity: 1,
        },
      ],
      metadata: {
        userId
      },
      success_url: `${process.env.CLIENT_URL}/thank-you`,
      cancel_url: `${process.env.CLIENT_URL}/cancelled`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create session' });
  }
});

// Stripe webhook endpoint
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const priceId = session.line_items?.[0]?.price?.id;

    console.log('✅ Payment successful for user:', userId);
    // TODO: Upisati pretplatu u bazu, dodeliti permisije
  }

  res.status(200).send();
});

module.exports = router;
