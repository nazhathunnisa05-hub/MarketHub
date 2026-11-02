
import { useEffect, useState } from "react";
import api from "../services/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/orders/admin/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data.orders || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="container mt-4">Loading orders...</div>;

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Admin Order Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {!error && orders.length === 0 && (
        <p>No orders found.</p>
      )}

      {orders.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.slice(-8)}</td>

                  <td>
                    {order.customerId?.name || "Unknown"}
                    <br />
                    <small>{order.customerId?.email || ""}</small>
                  </td>

                  <td>
                    {order.items?.map((item, index) => (
                      <div key={index}>
                        {item.name} × {item.quantity}
                      </div>
                    ))}
                  </td>

                  <td>₹{Number(order.totalAmount || 0).toFixed(2)}</td>

                  <td>
                    <span className="badge bg-info text-dark">
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td>
                    <span className="badge bg-secondary">
                      {order.orderStatus}
                    </span>
                  </td>

                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
