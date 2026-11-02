
import { useEffect, useState } from "react";
import api from "../services/api";

function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/vendor", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setOrders(response.data);
    } catch (error) {
      console.error("Orders loading error:", error);
      alert(
        error.response?.data?.message ||
        "Unable to load vendor orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      console.log("Updating order:", orderId);
      console.log("New status:", status);

      const response = await api.patch(
        `/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(response.data.message || "Order status updated!");
      await fetchOrders();

    } catch (error) {
      console.error("Status update error:", error);
      console.error("Server response:", error.response?.data);

      alert(
        error.response?.data?.message ||
        "Unable to update order"
      );
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4">Vendor Order Management</h2>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <h4>No orders received yet.</h4>
        </div>
      ) : (
        orders.map((order) => (
          <div className="card mb-4" key={order._id}>
            <div className="card-header d-flex justify-content-between flex-wrap">
              <strong>
                Order ID: {order._id}
              </strong>

              <span className="badge bg-primary">
                {order.orderStatus || "placed"}
              </span>
            </div>

            <div className="card-body">
              <h5>Customer Delivery Details</h5>

              <p>
                {order.shippingAddress.fullName} |{" "}
                {order.shippingAddress.phone}
              </p>

              <p>
                {order.shippingAddress.street},{" "}
                {order.shippingAddress.city},{" "}
                {order.shippingAddress.state} -{" "}
                {order.shippingAddress.pincode}
              </p>

              <hr />

              <h5>Your Products in This Order</h5>

              {order.items.map((item, index) => (
                <div
                  key={item._id || index}
                  className="d-flex justify-content-between border-bottom py-2"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span>
                    ₹{item.subtotal}
                  </span>
                </div>
              ))}

              <p className="mt-3">
                <strong>Your items total:</strong> ₹
                {order.items.reduce(
                  (sum, item) => sum + item.subtotal,
                  0
                ).toFixed(2)}
              </p>

              <div className="mt-3">
                <label className="form-label">
                  Update Order Status
                </label>

                <select
                  className="form-select"
                  value={order.orderStatus || "placed"}
                  onChange={(e) =>
                    updateStatus(order._id, e.target.value)
                  }
                  disabled={
                    order.orderStatus === "delivered" ||
                    order.orderStatus === "cancelled"
                  }
                >
                  {["placed", "packed", "shipped", "delivered"].map(
                    (status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() +
                          status.slice(1)}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default VendorOrders;
