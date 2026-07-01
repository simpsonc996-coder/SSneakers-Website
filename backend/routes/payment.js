import dotenv from "dotenv";
dotenv.config();

import express from "express";
import Razorpay from "razorpay";

const router = express.Router();

//const razorpay = new Razorpay({
  //key_id: process.env.RAZORPAY_KEY_ID, // process exists only in Node.js (backend). In frontend, use different method
  //key_secret: process.env.RAZORPAY_SECRET,
//});

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    
// Using PayPal on the frontend
    //const order = await razorpay.orders.create({
      //amount: amount * 100,
      //currency: "INR",
      //receipt: "receipt_" + Date.now(),
      //});
      
      res.json({ status: "success", message: "Mock order bypassed for PayPal" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;