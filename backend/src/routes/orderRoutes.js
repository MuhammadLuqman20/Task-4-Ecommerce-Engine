import express from 'express';
import {
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/my-orders', getMyOrders);
router.get('/', adminOnly, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', adminOnly, updateOrderStatus);

export default router;
