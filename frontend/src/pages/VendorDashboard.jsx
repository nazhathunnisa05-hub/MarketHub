
import { useEffect, useState } from "react";
import api from "../services/api";

function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: ""
  });

  const [image, setImage] = useState(null);

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get(
        "/products/my-products",
        authConfig
      );
      setProducts(response.data);
    } catch (err) {
      setError("Unable to load your products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      let imageKey = null;
if (!image) {
  setError("Please select a product image.");
  return;
}

const imageData = new FormData();
imageData.append("image", image);

console.log("Selected image:", image.name);
console.log("Image size:", image.size);

const uploadResponse = await api.post(
  "/uploads/image",
  imageData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": undefined
    }
  }
);

console.log("Image upload response:", uploadResponse.data);

imageKey = uploadResponse.data.key;
      

      await api.post(
        "/products",
        {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
          imageKey
        },
        authConfig
      );

      setMessage("Product added successfully!");

      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: ""
      });

      setImage(null);

      e.target.reset();
      fetchProducts();

    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add product."
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await api.delete(`/products/${id}`, authConfig);
      setMessage("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      setError("Unable to delete product.");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-2">Vendor Dashboard</h2>
      <p className="text-secondary">
        Manage your marketplace products.
      </p>

      {message && (
        <div className="alert alert-success">{message}</div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="card shadow-sm border-0 p-4 mb-5">
        <h4 className="fw-bold mb-4">Add New Product</h4>

        <form onSubmit={handleAddProduct}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Product Name</label>
              <input
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Category</label>
              <input
                name="category"
                className="form-control"
                value={form.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Price (₹)</label>
              <input
                type="number"
                name="price"
                min="0.01"
                step="0.01"
                className="form-control"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Stock</label>
              <input
                type="number"
                name="stock"
                min="0"
                className="form-control"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Product Image</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="form-control"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            <div className="col-12">
              <button className="btn btn-primary">
                Add Product
              </button>
            </div>
          </div>
        </form>
      </div>

      <h4 className="fw-bold mb-4">My Products</h4>

      {loading && <p>Loading products...</p>}

      {!loading && products.length === 0 && (
        <p>You haven't added any products yet.</p>
      )}

      <div className="row g-4">
        {products.map((product) => (
          <div className="col-md-4 col-lg-3" key={product._id}>
            <div className="card h-100 shadow-sm border-0">
              <img
                src={
                  product.imageUrl ||
                  "https://placehold.co/400x300?text=No+Image"
                }
                alt={product.name}
                className="card-img-top"
                style={{ height: "180px", objectFit: "cover" }}
              />

              <div className="card-body">
                <h6 className="fw-bold">{product.name}</h6>
                <p className="text-secondary small">
                  {product.category}
                </p>
                <h5 className="text-primary">
                  ₹{product.price}
                </h5>
                <p className="small">Stock: {product.stock}</p>

                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDelete(product._id)}
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VendorDashboard;
