
import { useEffect, useState } from "react";
import api from "../services/api";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProducts(response.data.products || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to delete product"
      );
    }
  };

  if (loading) {
    return <div className="container mt-5">Loading products...</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold">Product Management</h2>
      <p className="text-muted">View and manage marketplace products.</p>

      {message && (
        <div className="alert alert-info">{message}</div>
      )}

      <h5 className="mb-3">
        Total Products: {products.length}
      </h5>

      {products.length === 0 ? (
        <div className="alert alert-secondary">
          No products found.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>{product.category}</td>
                  <td>₹{product.price}</td>
                  <td>{product.stock}</td>
                  <td>
                    {product.vendorId?.name || "Unknown"}
                  </td>
                  <td>
                    <span className={`badge ${
                      product.status === "active"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteProduct(product._id)}
                    >
                      Delete
                    </button>
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

export default AdminProducts;
