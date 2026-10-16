import { getStripe, isRealStripeConfigured } from '../config/stripe.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Create Stripe PaymentIntent from current user's cart
// @route   POST /api/checkout/create-payment-intent
// @access  Private
export const createPaymentIntent = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your shopping cart is empty',
      });
    }

    // Verify stock and calculate exact server-side subtotal
    let subtotal = 0;
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({
          success: false,
          message: 'An item in your cart is no longer available. Please review your cart.',
        });
      }
      if (item.quantity > item.product.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product.title}". Only ${item.product.stockQuantity} available.`,
        });
      }
      subtotal += item.product.price * item.quantity;
    }

    const taxPrice = Number((subtotal * 0.08).toFixed(2));
    const shippingPrice = subtotal > 100 ? 0 : 10.0;
    const totalPrice = Number((subtotal + taxPrice + shippingPrice).toFixed(2));
    const amountInCents = Math.round(totalPrice * 100);

    const stripeConfigured = isRealStripeConfigured();

    if (stripeConfigured) {
      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          userId: req.user._id.toString(),
          cartId: cart._id.toString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalPrice,
        currency: 'usd',
        isSandboxMock: false,
      });
    } else {
      // Sandbox fallback mode when user is testing without live Stripe API keys configured
      const mockPaymentIntentId = `pi_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const mockClientSecret = `${mockPaymentIntentId}_secret_test`;

      return res.status(200).json({
        success: true,
        clientSecret: mockClientSecret,
        paymentIntentId: mockPaymentIntentId,
        amount: totalPrice,
        currency: 'usd',
        isSandboxMock: true,
        notice: 'Stripe test mode running in sandbox simulator. To use real Stripe Elements, add sk_test_... to backend/.env',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment status server-side, deduct stock atomically, create Order & clear cart
// @route   POST /api/checkout/verify-payment
// @access  Private
export const verifyPaymentAndCreateOrder = async (req, res, next) => {
  try {
    const { paymentIntentId, shippingAddress } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'PaymentIntent ID is required for verification',
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required',
      });
    }

    // Idempotency check: verify if an order was already processed for this payment intent
    const existingOrder = await Order.findOne({
      'paymentInfo.stripePaymentIntentId': paymentIntentId,
    });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: 'Order already processed',
        data: existingOrder,
      });
    }

    // Server-side payment verification
    let isPaymentValid = false;

    if (paymentIntentId.startsWith('pi_sandbox_')) {
      // Valid sandbox test transaction
      isPaymentValid = true;
    } else {
      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        isPaymentValid = true;
      } else {
        return res.status(400).json({
          success: false,
          message: `Payment not completed. Stripe status: ${paymentIntent?.status || 'unknown'}`,
        });
      }
    }

    if (!isPaymentValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Retrieve user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty or has already been fulfilled',
      });
    }

    // Atomic Inventory Deduction
    const orderItems = [];
    let itemsPrice = 0;

    for (const item of cart.items) {
      const productId = item.product._id;
      const requestedQty = item.quantity;

      // Atomically decrement stock if and only if stockQuantity >= requestedQty
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          stockQuantity: { $gte: requestedQty },
        },
        {
          $inc: { stockQuantity: -requestedQty },
        },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(400).json({
          success: false,
          message: `Inventory error: "${item.product.title}" is out of stock or requested quantity is unavailable.`,
        });
      }

      const itemTotal = item.product.price * requestedQty;
      itemsPrice += itemTotal;

      orderItems.push({
        product: productId,
        title: item.product.title,
        imageUrl: item.product.imageUrl,
        price: item.product.price,
        quantity: requestedQty,
      });
    }

    const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
    const shippingPrice = itemsPrice > 100 ? 0 : 10.0;
    const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    // Create Order with confirmed payment status
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentInfo: {
        status: 'paid',
        stripePaymentIntentId: paymentIntentId,
        currency: 'usd',
        paidAt: new Date(),
      },
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Clear user's cart after confirmed order
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Payment confirmed and order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe Webhook Listener
// @route   POST /api/checkout/webhook
// @access  Public (Stripe signature verified)
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret.includes('placeholder')) {
    return res.status(200).json({ received: true, simulated: true });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`[Stripe Webhook Error]: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log(`[Stripe Webhook] PaymentIntent ${paymentIntent.id} succeeded`);
  }

  return res.status(200).json({ received: true });
};
