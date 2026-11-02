import api from "./api";

export const handleRazorpayPayment = async (
  orderId,
  token,
  navigate
) => {
  try {
    const response = await api.post(
      "/payments/create-order",
      { orderId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const paymentData = response.data;

    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: "MarketHub",
      description: "Marketplace Purchase",
      order_id: paymentData.razorpayOrderId,

      handler: async function (paymentResponse) {
        try {
          await api.post(
            "/payments/verify",
            {
              orderId,
              razorpay_order_id:
                paymentResponse.razorpay_order_id,
              razorpay_payment_id:
                paymentResponse.razorpay_payment_id,
              razorpay_signature:
                paymentResponse.razorpay_signature
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          alert("Payment successful!");
          navigate("/my-orders");

        } catch (error) {
          alert(
            error.response?.data?.message ||
            "Payment verification failed"
          );
        }
      }
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", () => {
      alert("Payment failed. Please try again.");
    });

    razorpay.open();

  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Unable to start payment"
    );
  }
};