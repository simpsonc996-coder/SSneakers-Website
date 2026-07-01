import express from 'express';
import Checkout from '../models/Checkout.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route POST /api/checkout
// @desc Create a new checkout
// @access Private
router.post('/', protect, async (req, res) => {
    const {checkoutItems, shippingAddress, paymentMethod, totalPrice, totalPriceUSD} = req.body;
    if(!checkoutItems || checkoutItems.length === 0) {
        return res.status(400).json({message: 'No checkout items provided'});
    }
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    try {
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems: checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            totalPriceUSD: totalPriceUSD || null,
            paymentStatus: 'Pending',
            isPaid: false,
        });
        console.log(`Checkout created for user: ${newCheckout._id}`);
        res.status(201).json(newCheckout);
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({message: error.message || 'Server error'});
    }
});

// @route PUT /api/checkout/:id/pay
// @desc Update checkout to paid after successful payment
// @access Private
router.put('/:id/pay', protect, async (req, res) => {
    const { paymentStatus, paymentDetails } = req.body;

    if (!paymentDetails || !paymentDetails.id) {
        return res.status(400).json({ message: 'PayPal payment details are required' });
    }

    try {
        const checkout = await Checkout.findById(req.params.id);
        if (!checkout) {
            return res.status(404).json({ message: 'Checkout not found' });
        }

        if (paymentStatus !== 'paid') {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        if (checkout.paymentMethod === 'PayPal') {
            if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
                return res.status(500).json({ message: 'PayPal credentials are not configured on the server' });
            }

            const paypalBaseUrl = process.env.PAYPAL_MODE === 'live'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com';

            const authTokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'grant_type=client_credentials',
            });

            const authTokenData = await authTokenResponse.json();
            if (!authTokenResponse.ok) {
                console.error('PayPal token fetch failed', authTokenData);
                return res.status(502).json({ message: 'Unable to verify PayPal payment at this time' });
            }

            const orderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${paymentDetails.id}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authTokenData.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            const orderData = await orderResponse.json();
            if (!orderResponse.ok || orderData.status !== 'COMPLETED') {
                console.error('PayPal order verification failed', orderData);
                return res.status(400).json({ message: 'PayPal payment could not be verified' });
            }

            const paidAmount = Number(orderData.purchase_units?.[0]?.amount?.value || 0);
            const expectedUSD = checkout.totalPriceUSD
                ? Number(checkout.totalPriceUSD)
                : null;
            if (expectedUSD !== null && Math.abs(expectedUSD - paidAmount) > 0.05) {
                console.error(`Amount mismatch: expected $${expectedUSD} USD, PayPal charged $${paidAmount} USD`);
                return res.status(400).json({ message: 'PayPal order amount does not match checkout total' });
            }

            checkout.isPaid = true;
            checkout.paymentStatus = paymentStatus;
            checkout.paymentDetails = {
                ...paymentDetails,
                paypalOrder: orderData,
                verifiedAt: new Date(),
            };
            checkout.paidAt = Date.now();
            await checkout.save();
            return res.status(200).json(checkout);
        }

        // Fallback for non-PayPal payment methods
        checkout.isPaid = true;
        checkout.paymentStatus = paymentStatus;
        checkout.paymentDetails = paymentDetails;
        checkout.paidAt = Date.now();
        await checkout.save();
        res.status(200).json(checkout);
    } catch (error) {
        console.error("Error updating checkout:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route POST /api/checkout/:id/finalize
// @desc Finalize checkout and convert to an order after payment confirmation
// @access Private
router.post('/:id/finalize', protect, async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);
        if (!checkout) {
            return res.status(404).json({ message: 'Checkout not found' });
        }
        if (checkout.isPaid && !checkout.isFinalized) {
            // Create final order based on checkout details
            const finalOrder = await Order.create({
                user: checkout.user,
                orderItems: checkout.checkoutItems,
                shippingAddress: checkout.shippingAddress,
                paymentMethod: checkout.paymentMethod,
                totalPrice: checkout.totalPrice,
                isPaid: checkout.isPaid,
                paidAt: checkout.paidAt,
                isDelivered: false,
                paymentStatus: 'paid',
                paymentDetails: checkout.paymentDetails,
            });

            // Mark checkout as finalized to prevent duplicate orders
            checkout.isFinalized = true;
            checkout.finalizedAt = Date.now();
            await checkout.save();

            // Delete the cart associated with the user
            await Cart.findOneAndDelete({ user: checkout.user });

            console.log(`Checkout finalized and order created: ${finalOrder._id}`);
            res.status(201).json(finalOrder);
        } else if (checkout.isFinalized) {
            res.status(400).json({ message: 'Checkout already finalized' });
        } else {
            res.status(400).json({ message: 'Checkout not paid' });
        }
    } catch (error) {
        console.error("Error finalizing checkout:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;