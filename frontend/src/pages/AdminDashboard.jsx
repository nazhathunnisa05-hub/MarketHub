
import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    vendors: 0,
    products: 0,
    orders: 0,
    revenue: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setStats(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    { title: "Total Customers", value: stats.customers },
    { title: "Total Vendors", value: stats.vendors },
    { title: "Total Products", value: stats.products },
    { title: "Total Orders", value: stats.orders },
    {
      title: "Total Revenue",
      value: `₹${Number(stats.revenue).toLocaleString("en-IN")}`
    }
  ];

  if (loading) {
    return <div className="container mt-5">Loading dashboard...</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold">MarketHub Admin Dashboard</h2>
      <p className="text-muted">
        Monitor and manage your marketplace.
      </p>

      {error && (
        <div className="alert alert-warning">{error}</div>
      )}

      <div className="row g-4 mt-2">
        {cards.map((card) => (
          <div className="col-md-4" key={card.title}>
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="text-muted">{card.title}</h6>
                <h3 className="fw-bold">{card.value}</h3>
              </div>
            </div>
          </div>
        ))}
        <div className="mt-4">
  <a href="/admin/vendors" className="btn btn-primary">
    Manage Vendor Applications
  </a>
</div>
<div className="mt-3">
  <a href="/admin/products" className="btn btn-primary">
    Manage Products
  </a>
  </div>
  <div className="mt-3">
  <a href="/admin/orders" className="btn btn-primary me-2">
  Manage Orders
</a>
</div>
  <div className="mt-3">
    <a href="/admin/coupons" className="btn btn-primary me-2">
  Manage Coupons
</a>
</div>
      </div>
    </div>
  );
}

export default AdminDashboard;
