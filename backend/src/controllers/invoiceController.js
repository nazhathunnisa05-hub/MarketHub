
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");

exports.downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find only the logged-in customer's order
    const order = await Order.findOne({
      _id: orderId,
      customerId: req.user.id
    }).populate("customerId", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found."
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=MarketHub-Invoice-${order._id}.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(24).text("MarketHub", { align: "center" });
    doc.fontSize(12).text("ORDER INVOICE", { align: "center" });
    doc.moveDown(2);

    // Order details
    doc.fontSize(11);
    doc.text(`Invoice / Order ID: ${order._id}`);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);
    doc.text(`Order Status: ${order.orderStatus}`);
    doc.moveDown();

    // Customer details
    doc.fontSize(14).text("Customer Details");
    doc.fontSize(11);
    doc.text(`Name: ${order.shippingAddress.fullName}`);
    doc.text(`Email: ${order.customerId?.email || "N/A"}`);
    doc.text(`Phone: ${order.shippingAddress.phone}`);
    doc.moveDown();

    // Shipping address
    doc.fontSize(14).text("Shipping Address");
    doc.fontSize(11);
    doc.text(order.shippingAddress.street);
    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`
    );
    doc.moveDown();

    // Products
    doc.fontSize(14).text("Order Items");
    doc.moveDown(0.5);

    doc.fontSize(11);

    order.items.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.name} | Qty: ${item.quantity} | Price: Rs. ${Number(item.price).toFixed(2)} | Subtotal: Rs. ${Number(item.subtotal).toFixed(2)}`
      );
    });

    doc.moveDown();

    // Price summary
    doc.fontSize(11);
    doc.text(`Subtotal: Rs. ${Number(order.subtotal).toFixed(2)}`);
    doc.text(`Coupon: ${order.couponCode || "Not applied"}`);
    doc.text(`Discount: Rs. ${Number(order.discountAmount || 0).toFixed(2)}`);

    doc.moveDown(0.5);
    doc.fontSize(15).text(
      `Total Amount: Rs. ${Number(order.totalAmount).toFixed(2)}`
    );

    doc.moveDown(3);
    doc.fontSize(10).text(
      "Thank you for shopping with MarketHub!",
      { align: "center" }
    );

    doc.end();
  } catch (error) {
    console.error("Invoice generation error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Unable to generate invoice."
      });
    }
  }
};
