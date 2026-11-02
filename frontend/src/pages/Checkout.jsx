
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import axios from "axios";
import { handleRazorpayPayment } from "../services/payment";

function Checkout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get("/cart", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCart(response.data);
      } catch (error) {
        console.error("Cart loading error:", error);
        alert(error.response?.data?.message || "Unable to load cart");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCart();
    } else {
      setLoading(false);
      navigate("/login");
    }
  }, [token, navigate]);

  // Calculate subtotal
  const total = cart.items.reduce((sum, item) => {
    return item.productId
      ? sum + item.productId.price * item.quantity
      : sum;
  }, 0);

  // Calculate final amount after coupon
  const finalTotal = Math.max(0, total - discount);

  // Address input
  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };

  // Coupon input
  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
    setDiscount(0);
    setCouponApplied(false);
    setCouponMessage("");
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    try {
      setApplyingCoupon(true);
      setCouponMessage("");

      const response = await api.post(
        "/coupons/validate",
        {
          code: couponCode.trim(),
          orderAmount: total
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDiscount(Number(response.data.discount));
      setCouponApplied(true);
      setCouponMessage("Coupon applied successfully!");
    } catch (error) {
      setDiscount(0);
      setCouponApplied(false);
      setCouponMessage(
        error.response?.data?.message || "Invalid coupon code."
      );
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setDiscount(0);
    setCouponApplied(false);
    setCouponCode("");
    setCouponMessage("Coupon removed.");
  };

  
// Place order
const handleSubmit = async (e) => {
  e.preventDefault();

  if (placingOrder) return;

  try {
    setPlacingOrder(true);

    const response = await api.post(
      "/orders",
      {
        shippingAddress: address,
        couponCode: couponApplied ? couponCode : null
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    alert("Order placed successfully!");

    // Start Razorpay payment
    await handleRazorpayPayment(
      response.data.order._id,
      localStorage.getItem("token"),
      navigate
    );

  } catch (error) {
    console.error("Order error:", error.response?.data);

    alert(
      error.response?.data?.message ||
      error.message ||
      "Unable to place order"
    );
  } finally {
    setPlacingOrder(false);
  }
};
  
  const handlePayment = async (orderId) => {
  try {
    const token = localStorage.getItem("token");

    // Step 1: Create Razorpay payment order
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

    // Step 2: Open Razorpay checkout
    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: "MarketHub",
      description: "Marketplace Purchase",
      order_id: paymentData.razorpayOrderId,

      handler: async function (paymentResponse) {
        try {
          // Step 3: Verify payment on backend
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
      },

      modal: {
        ondismiss: function () {
          alert("Payment cancelled. You can retry from your orders.");
        }
      },

      theme: {
        color: "#2563eb"
      }
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function () {
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

  if (loading) {
    return <div className="container mt-5">Loading...</div>;
  }

  if (!cart.items.length) {
    return (
      <div className="container mt-5 text-center">
        <h3>Your cart is empty.</h3>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/products")}
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4">Checkout</h2>

      <div className="row">
        {/* Delivery Address */}
        <div className="col-md-7">
          <div className="card p-4">
            <h4>Delivery Address</h4>

            <form onSubmit={handleSubmit}>
              {[
                ["fullName", "Full Name"],
                ["phone", "Phone Number"],
                ["street", "Street Address"],
                ["city", "City"],
                ["state", "State"],
                ["pincode", "PIN Code"]
              ].map(([name, label]) => (
                <div className="mb-3" key={name}>
                  <label className="form-label">{label}</label>

                  <input
                    className="form-control"
                    name={name}
                    value={address[name]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <button
                className="btn btn-success w-100"
                type="submit"
                disabled={placingOrder}
              >
                {placingOrder
                  ? "Placing Order..."
                  : "Continue to Place Order"}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-md-5">
          <div className="card p-4">
            <h4>Order Summary</h4>

            {cart.items.map((item) => (
              <div
                key={item.productId?._id}
                className="d-flex justify-content-between mb-2"
              >
                <span>
                  {item.productId?.name} × {item.quantity}
                </span>

                <span>
                  ₹{item.productId
                    ? (item.productId.price * item.quantity).toFixed(2)
                    : "0.00"}
                </span>
              </div>
            ))}

            <hr />

            <div className="d-flex justify-content-between">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            {/* Coupon */}
            <div className="mt-4">
              <label className="form-label">Coupon Code</label>

              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={handleCouponChange}
                  disabled={couponApplied || applyingCoupon}
                />

                {couponApplied ? (
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || applyingCoupon}
                  >
                    {applyingCoupon ? "Applying..." : "Apply"}
                  </button>
                )}
              </div>

              {couponMessage && (
                <p className={`mt-2 ${
                  couponApplied ? "text-success" : "text-danger"
                }`}>
                  {couponMessage}
                </p>
              )}
            </div>

            <hr />

            <div className="d-flex justify-content-between text-success">
              <span>Coupon Discount</span>
              <span>- ₹{discount.toFixed(2)}</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between">
              <h5>Final Total</h5>
              <h5 className="text-success">
                ₹{finalTotal.toFixed(2)}
              </h5>
            </div>

            <small className="text-muted mt-2">
              The coupon discount is deducted from your order subtotal.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
