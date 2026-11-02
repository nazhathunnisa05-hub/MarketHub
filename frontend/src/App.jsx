
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import VendorApplication from "./pages/VendorApplication";
import VendorDashboard from "./pages/VendorDashboard";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";

import Checkout from "./pages/Checkout";

import MyOrders from "./pages/MyOrders";
import VendorOrders from "./pages/VendorOrders";
import AdminDashboard from "./pages/AdminDashboard";

import AdminVendors from "./pages/AdminVendors";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";

import AdminCoupons from "./pages/AdminCoupons";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <Navbar />

        <Routes>
          <Route
  path="/vendor-orders"
  element={
    <ProtectedRoute allowedRoles={["vendor"]}>
      <VendorOrders />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/coupons"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminCoupons />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/orders"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminOrders />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/vendors"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminVendors />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/products"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminProducts />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin-dashboard"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer applies to become a vendor */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <VendorApplication />
              </ProtectedRoute>
            }
          />

          {/* Vendor dashboard */}
          <Route
            path="/vendor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin dashboard */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div className="container py-5">
                  <h2>Admin Dashboard</h2>
                  <p>Welcome to the administration panel.</p>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
