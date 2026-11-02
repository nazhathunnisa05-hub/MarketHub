const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const crypto = require("crypto");

exports.createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required"
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customerId: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Order is already paid"
      });
    }

    const amountInPaise = Math.round(order.totalAmount * 100);

    const payment = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order._id.toString()
    });

    order.razorpayOrderId = payment.id;
    await order.save();

    res.status(201).json({
      message: "Payment order created successfully",
      razorpayOrderId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("Payment creation error:", error);

    res.status(500).json({
      message: "Unable to create payment order"
    });
  }
};
exports.verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment verification details are required"
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customerId: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Order is already paid"
      });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        message: "Payment order ID does not match"
      });
    }

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const signatureBuffer = Buffer.from(
      expectedSignature,
      "hex"
    );

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "hex"
    );

    if (
      signatureBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(
        signatureBuffer,
        receivedBuffer
      )
    ) {
      return res.status(400).json({
        message: "Invalid payment signature"
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentStatus = "paid";

    await order.save();

    res.json({
      message: "Payment verified successfully",
      order
    });

  } catch (error) {
    console.error("Payment verification error:", error);

    res.status(500).json({
      message: "Payment verification failed"
    });
  }
};
exports.razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
      .update(req.body)
      .digest("hex");

    const expected = Buffer.from(expectedSignature, "hex");
    const received = Buffer.from(signature || "", "hex");

    if (
      expected.length !== received.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      return res.status(400).json({
        message: "Invalid webhook signature"
      });
    }

    const event = JSON.parse(req.body.toString());

    const payment = event.payload.payment?.entity;

if (event.event === "payment.captured" && payment) {
  await Order.findOneAndUpdate(
    {
      razorpayOrderId: payment.order_id,
      paymentStatus: "pending"
    },
    {
      $set: {
        paymentStatus: "paid",
        razorpayPaymentId: payment.id
      }
    }
  );
}

else if (event.event === "payment.failed" && payment) {
  await Order.findOneAndUpdate(
    {
      razorpayOrderId: payment.order_id,
      paymentStatus: "pending"
    },
    {
      $set: {
        paymentStatus: "failed"
      }
    }
  );
}
    res.json({ received: true });

  } catch (error) {
    console.error("Razorpay webhook error:", error);

    res.status(500).json({
      message: "Webhook processing failed"
    });
  }
};