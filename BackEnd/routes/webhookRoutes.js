const express = require('express');
const webhookController = require('./../controller/webhookController');

const router = express.Router();

// Stripe sends the raw request body, and its signature is computed over
// those raw bytes. express.raw() must run here — and this router must be
// mounted in app.js BEFORE express.json() — otherwise the JSON parser
// consumes the body first and signature verification always fails.
router.post(
  '/',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

module.exports = router;
