import express from 'express';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route GET /api/admin/orders
// @desc Get all orders (admin only)
// @access Private/admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route PUT /api/admin/orders/:id
// @desc Update order status (admin only)
// @access Private/admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
            order.status = req.body.status || order.status;
            order.isDelivered = req.body.status === "delivered" ? true : order.isDelivered;
            order.deliveredAt = req.body.status === "delivered" ? Date.now() : order.deliveredAt;
            const updatedOrder = await order.save();
            const populatedOrder = await Order.findById(updatedOrder._id).populate('user');
            res.json(populatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route DELETE /api/admin/orders/:id
// @desc Delete an order (admin only)
// @access Private/admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            await order.deleteOne();
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;