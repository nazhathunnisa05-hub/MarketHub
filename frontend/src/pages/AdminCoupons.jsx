
import { useEffect, useState } from "react";
import api from "../services/api";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrderAmount: 0,
    maximumDiscount: "",
    expiryDate: "",
    usageLimit: 100
  });

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const fetchCoupons = async () => {
    try {
      const response = await api.get("/coupons/admin/all", {
        headers
      });
      setCoupons(response.data.coupons || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load coupons."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const createCoupon = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/coupons",
        {
          ...form,
          code: form.code.trim().toUpperCase(),
          discountValue: Number(form.discountValue),
          minimumOrderAmount: Number(form.minimumOrderAmount),
          maximumDiscount:
            form.maximumDiscount === ""
              ? null
              : Number(form.maximumDiscount),
          usageLimit: Number(form.usageLimit)
        },
        { headers }
      );

      alert("Coupon created successfully!");

      setForm({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minimumOrderAmount: 0,
        maximumDiscount: "",
        expiryDate: "",
        usageLimit: 100
      });

      fetchCoupons();
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to create coupon."
      );
    }
  };

  const toggleStatus = async (coupon) => {
    try {
      await api.patch(
        `/coupons/${coupon._id}/status`,
        { isActive: !coupon.isActive },
        { headers }
      );

      fetchCoupons();
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to update coupon."
      );
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      await api.delete(`/coupons/${id}`, { headers });
      fetchCoupons();
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to delete coupon."
      );
    }
  };

  if (loading) {
    return <div className="container mt-4">Loading coupons...</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Admin Coupon Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Create New Coupon</h5>
        </div>

        <div className="card-body">
          <form onSubmit={createCoupon}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Coupon Code</label>
                <input
                  className="form-control"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="WELCOME20"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Discount Type</label>
                <select
                  className="form-select"
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Discount Value</label>
                <input
                  type="number"
                  min="1"
                  max={form.discountType === "percentage" ? "100" : undefined}
                  className="form-control"
                  name="discountValue"
                  value={form.discountValue}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Minimum Order Amount</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  name="minimumOrderAmount"
                  value={form.minimumOrderAmount}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Maximum Discount</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  name="maximumDiscount"
                  value={form.maximumDiscount}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Expiry Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  min={new Date().toLocaleDateString("en-CA")}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  name="usageLimit"
                  value={form.usageLimit}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className="btn btn-primary mt-3" type="submit">
              Create Coupon
            </button>
          </form>
        </div>
      </div>

      <h4 className="mb-3">All Coupons ({coupons.length})</h4>

      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Minimum Order</th>
              <th>Usage</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td>{coupon.code}</td>
                <td>
                  {coupon.discountValue}
                  {coupon.discountType === "percentage" ? "%" : " ₹"}
                </td>
                <td>₹{coupon.minimumOrderAmount}</td>
                <td>
                  {coupon.usedCount} / {coupon.usageLimit}
                </td>
                <td>
                  {new Date(coupon.expiryDate).toLocaleDateString()}
                </td>
                <td>
                  <span
                    className={`badge ${
                      coupon.isActive ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2 mb-1"
                    onClick={() => toggleStatus(coupon)}
                  >
                    {coupon.isActive ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    className="btn btn-sm btn-danger mb-1"
                    onClick={() => deleteCoupon(coupon._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {coupons.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">
                  No coupons available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCoupons;
