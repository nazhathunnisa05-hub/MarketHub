import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCart(response.data);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "customer") {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, []);

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.patch(
        `/cart/items/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchCart();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/items/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchCart();
    } catch (error) {
      alert("Unable to remove product");
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchCart();
    } catch (error) {
      alert("Unable to clear cart");
    }
  };

  const total = cart.items.reduce((sum, item) => {
    const product = item.productId;

    return product
      ? sum + product.price * item.quantity
      : sum;
  }, 0);

  if (loading) return <div className="container mt-5">Loading cart...</div>;

  if (!user || user.role !== "customer") {
    return (
      <div className="container mt-5 text-center">
        <h3>Please log in as a customer to view your cart.</h3>
        <button className="btn btn-primary" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Shopping Cart</h2>

      {cart.items.length === 0 ? (
        <div className="text-center py-5">
          <h4>Your cart is empty!</h4>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          {cart.items.map((item) => {
            const product = item.productId;

            if (!product) return null;

            return (
              <div className="card mb-3" key={product._id}>
                <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div>
                    <h5>{product.name}</h5>
                    <p>Price: ₹{product.price}</p>
                    <p>Subtotal: ₹{product.price * item.quantity}</p>
                  </div>

                  <div>
                    <button
                      className="btn btn-outline-secondary"
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        updateQuantity(product._id, item.quantity - 1)
                      }
                    >
                      -
                    </button>

                    <span className="mx-3">{item.quantity}</span>

                    <button
                      className="btn btn-outline-secondary"
                      disabled={item.quantity >= product.stock}
                      onClick={() =>
                        updateQuantity(product._id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="btn btn-danger"
                    onClick={() => removeItem(product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          <div className="text-end mt-4">
            <h4>Total: ₹{total.toFixed(2)}</h4>

            <button className="btn btn-outline-danger me-2" onClick={clearCart}>
              Clear Cart
            </button>

            <button
              className="btn btn-success"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;