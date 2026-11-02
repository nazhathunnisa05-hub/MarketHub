
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ProductReviews from "../components/ProductReviews";
import { handleRazorpayPayment } from "../services/payment";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get("/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setOrders(response.data);
      } catch (error) {
        console.error("Orders loading error:", error);
        setError(
          error.response?.data?.message || "Unable to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const retryPayment = async (orderId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      setPayingOrderId(orderId);

      await handleRazorpayPayment(orderId, token, navigate);
    } catch (error) {
      console.error("Retry payment error:", error);
      alert(
        error.response?.data?.message ||
        "Unable to retry payment. Please try again."
      );
    } finally {
      setPayingOrderId(null);
    }
  };

  // Download PDF invoice
  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      setDownloadingOrderId(orderId);

      const response = await api.get(`/invoices/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: "blob"
      });

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf"
      });

      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `MarketHub-Invoice-${orderId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Invoice download error:", error);
      alert("Unable to download invoice. Please try again.");
    } finally {
      setDownloadingOrderId(null);
    }
  };

  if (loading) {
    return <div className="container mt-5">Loading orders...</div>;
  }

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4">My Orders</h2>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <h4>No orders found.</h4>
          <p>Start shopping to see your orders here.</p>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/products")}
          >
            Shop Now
          </button>
        </div>
      ) : (
        orders.map((order) => (
          <div className="card mb-4 shadow-sm" key={order._id}>
            <div className="card-header">
              <div className="d-flex justify-content-between flex-wrap gap-2">
                <span>
                  <strong>Order ID:</strong> {order._id}
                </span>

                <span className="badge bg-primary">
                  {order.orderStatus?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="card-body">
              <h5>Order Items</h5>

              {order.items.map((item, index) => (
                <div
                  key={item._id || index}
                  className="d-flex justify-content-between border-bottom py-2"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span>
                    ₹{Number(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="mt-3">
                <p>
                  <strong>Total:</strong> ₹
                  {Number(order.totalAmount).toFixed(2)}
                </p>

                <p>
                  <strong>Payment:</strong>{" "}
                  {order.paymentStatus?.toUpperCase()}
                </p>

                <p>
                  <strong>Delivery:</strong>{" "}
                  {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.state}
                </p>

                <p>
                  <strong>Ordered on:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                className="btn btn-success btn-sm mt-2 me-2"
                onClick={() => downloadInvoice(order._id)}
                disabled={downloadingOrderId === order._id}
              >
                {downloadingOrderId === order._id
                  ? "Downloading..."
                  : "Download Invoice PDF"}
              </button>

              {order.paymentStatus === "pending" &&
                order.orderStatus !== "cancelled" && (
                  <button
                    className="btn btn-primary btn-sm mt-2"
                    onClick={() => retryPayment(order._id)}
                    disabled={payingOrderId === order._id}
                  >
                    {payingOrderId === order._id
                      ? "Opening Payment..."
                      : "Retry Payment"}
                  </button>
                )}

              <hr />

              <h6>Order Progress</h6>

              <div className="d-flex justify-content-between flex-wrap gap-2">
                {["placed", "packed", "shipped", "delivered"].map(
                  (status) => {
                    const stages = [
                      "placed",
                      "packed",
                      "shipped",
                      "delivered"
                    ];

                    const currentIndex = stages.indexOf(
                      order.orderStatus
                    );

                    const completed =
                      stages.indexOf(status) <= currentIndex;

                    return (
                      <span
                        key={status}
                        className={`badge ${
                          completed ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {status.toUpperCase()}
                      </span>
                    );
                  }
                )}
              </div>

              {order.orderStatus === "delivered" && (
                <div className="mt-4">
                  <h5>Product Reviews</h5>

                  {order.items.map((item, index) => (
                    <div key={item._id || index} className="mt-3">
                      <h6>Review: {item.name}</h6>

                      <ProductReviews
                        productId={
                          item.productId?._id || item.productId
                        }
                        orderId={order._id}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyOrders;
