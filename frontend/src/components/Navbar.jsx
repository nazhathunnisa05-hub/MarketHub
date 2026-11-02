
import { Link } from "react-router-dom";
import { FaShoppingCart, FaStore } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { user, logout } = useAuth();
const { cartCount } = useCart();
  return (
    
    <nav className="navbar navbar-expand-lg bg-white shadow-sm py-3">
      <div className="container">
       {user?.role === "customer" && (
  <Link className="nav-link" to="/my-orders">
    My Orders
  </Link>
)}
{user?.role === "vendor" && (
  <Link className="nav-link" to="/vendor-orders">
    Manage Orders
  </Link>
)}
        <Link className="navbar-brand fw-bold text-primary fs-4" to="/">
          <FaStore className="me-2" />
          MarketHub
        </Link>
        {user?.role === "customer" && (
  <Link className="nav-link" to="/cart">
    <i className="bi bi-cart3"></i> Cart
    <span className="badge bg-danger ms-1">
      {cartCount}
    </span>
  </Link>
)}

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMenu">
          <ul className="navbar-nav mx-auto gap-lg-3">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products">Products</Link>
            </li>

            {user?.role === "customer" && (
              <li className="nav-item">
                <Link className="nav-link" to="/vendor">Become a Vendor</Link>
              </li>
            )}

            {user?.role === "vendor" && (
              <li className="nav-item">
                <Link className="nav-link" to="/vendor-dashboard">
                  Vendor Dashboard
                </Link>
              </li>
            )}

            {user?.role === "admin" && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin-dashboard">
                  Admin Dashboard
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="fw-semibold">{user.name}</span>
                <button
                  className="btn btn-outline-danger"
                  onClick={logout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}

            <Link to="/cart" className="btn btn-light">
              <FaShoppingCart /> Cart
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
