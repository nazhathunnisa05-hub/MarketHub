
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function VendorApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    storeName: "",
    description: "",
    businessEmail: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await api.post("/vendors/apply", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setMessage("Application submitted successfully! Waiting for admin approval.");

      setForm({
        storeName: "",
        description: "",
        businessEmail: ""
      });

    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to submit application"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p className="container py-5">Please log in to apply.</p>;
  }

  if (user.role !== "customer") {
    return <p className="container py-5">Only customer accounts can apply.</p>;
  }

  return (
    <div className="container py-5">
      <div
        className="card shadow-sm border-0 p-4 mx-auto"
        style={{ maxWidth: "600px" }}
      >
        <h2 className="fw-bold text-center mb-3">
          Become a Vendor
        </h2>

        <p className="text-secondary text-center mb-4">
          Start selling your products on MarketHub.
        </p>

        {message && (
          <div className="alert alert-success">{message}</div>
        )}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="form-label">Store Name</label>
          <input
            type="text"
            name="storeName"
            className="form-control mb-3"
            value={form.storeName}
            onChange={handleChange}
            required
          />

          <label className="form-label">Business Email</label>
          <input
            type="email"
            name="businessEmail"
            className="form-control mb-3"
            value={form.businessEmail}
            onChange={handleChange}
            required
          />

          <label className="form-label">Store Description</label>
          <textarea
            name="description"
            className="form-control mb-3"
            rows="4"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the products you plan to sell..."
          />

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <button
          className="btn btn-link mt-2"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default VendorApplication;
