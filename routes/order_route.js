// paymentRoutes.js
import express from 'express';
import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from 'pg-sdk-node';
import { randomUUID } from 'crypto';

const router = express.Router();

const clientId = 'TEST-M22PPV065W7R1_25041';
const clientSecret = 'OWYxZjA1YzYtZDBmMy00NTM2LWJmNmItMmZhNDBhNGU3NDlh';
const clientVersion = 1;
const env = Env.SANDBOX; // Change to PRODUCTION in live

const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

// Route to initiate payment
router.post('/pay', async (req, res) => {
  try {
    const { amount } = req.body;
    const merchantOrderId = randomUUID();
    const redirectUrl = "http://localhost:5173/success"; // Your frontend redirect

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amount)
      .redirectUrl(redirectUrl)
      .build();

    const response = await client.pay(request);
    res.json({ checkoutUrl: response.redirectUrl, orderId: merchantOrderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
