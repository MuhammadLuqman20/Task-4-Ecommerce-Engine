import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes require user authentication
router.use(protect);

router.route('/').get(getCart).delete(clearCart);
router.route('/items').post(addToCart);
router.route('/items/:productId').put(updateCartItemQuantity).delete(removeCartItem);

export default router;
