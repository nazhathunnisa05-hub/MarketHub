
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Products() {
  const navigate = useNavigate();

  // Call React hooks at the top level
  const { fetchCartCount } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";

  // Add product to cart
  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to add products to your cart.");
      navigate("/login");
      return;
    }

    try {
      await api.post(
        "/cart/items",
        {
          productId,
          quantity: 1
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      await fetchCartCount();

      alert("Product added to cart successfully!");

    } catch (error) {
      console.error("Add to cart error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to add product to cart"
      );
    }
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products", {
          params: { search, category, sort }
        });

        const data = response.data;

        setProducts(
          Array.isArray(data) ? data : data.products || []
        );

      } catch (err) {
        console.error(err);
        setError("Unable to load products. Please check your backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, sort]);

  // Update search filters
  const updateFilter = (key, value) => {
    const updated = new URLSearchParams(searchParams);

    if (value) {
      updated.set(key, value);
    } else {
      updated.delete(key);
    }

    setSearchParams(updated);
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Explore Products</h2>

      <div className="row g-3 mb-4">
        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              updateFilter("search", e.target.value)
            }
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={category}
            onChange={(e) =>
              updateFilter("category", e.target.value)
            }
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home & Living">Home & Living</option>
            <option value="Books">Books</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={sort}
            onChange={(e) =>
              updateFilter("sort", e.target.value)
            }
          >
            <option value="">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading && <p>Loading products...</p>}

      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p>No products found.</p>
      )}

      <div className="row g-4">
        {products.map((product) => (
          <div className="col-6 col-md-3" key={product._id}>
            <div className="card h-100 shadow-sm border-0">
              <img
                src={
                  product.imageUrl ||
                  "https://placehold.co/500x350?text=No+Image"
                }
                className="card-img-top"
                style={{
                  height: "200px",
                  objectFit: "cover"
                }}
                alt={product.name}
              />

              <div className="card-body">
                <small className="text-secondary">
                  {product.category}
                </small>

                <h6 className="fw-bold mt-2">
                  {product.name}
                </h6>

                <h5 className="text-primary">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </h5>

                <p className="small text-secondary">
                  Stock: {product.stock}
                </p>

                <button
                  className="btn btn-primary w-100"
                  onClick={() => handleAddToCart(product._id)}
                  disabled={product.stock <= 0}
                >
                  {product.stock <= 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
