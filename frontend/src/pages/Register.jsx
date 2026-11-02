
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      await api.post("/auth/register", form);

      setSuccess("Registration successful! Please log in.");

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0 mx-auto p-4" style={{ maxWidth: "450px" }}>
        <h2 className="text-center fw-bold mb-4">Create Account</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="name"
            className="form-control mb-3"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label className="form-label">Email Address</label>
          <input
            type="email"
            name="email"
            className="form-control mb-3"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-control mb-3"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          <button className="btn btn-primary w-100">
            Register
          </button>
        </form>

        <p className="text-center mt-3">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
