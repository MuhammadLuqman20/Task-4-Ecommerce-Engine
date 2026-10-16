import express from 'express';
import {
  createPaymentIntent,
  verifyPaymentAndCreateOrder,
  handleStripeWebhook,
} from '../controllers/checkoutController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/verify-payment', protect, verifyPaymentAndCreateOrder);
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;
