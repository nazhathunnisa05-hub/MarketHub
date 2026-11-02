
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const categories = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Books",
  "Accessories"
];

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 2499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
  },
  {
    id: 3,
    name: "Casual Backpack",
    price: 1299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"
  },
  {
    id: 4,
    name: "Running Shoes",
    price: 1899,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
  }
];

function Home() {
  return (
    <div>
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-7">
              <span className="badge bg-primary mb-3">
                Welcome to MarketHub
              </span>

              <h1 className="display-4 fw-bold">
                Discover Products.
                <br />
                Shop Smarter.
              </h1>

              <p className="lead text-secondary mt-3">
                Explore quality products from multiple trusted sellers
                in one convenient marketplace.
              </p>

              <Link to="/products" className="btn btn-primary btn-lg mt-3">
                Shop Now <FaArrowRight className="ms-2" />
              </Link>
            </div>

            <div className="col-md-5 mt-4 mt-md-0">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"
                alt="Online shopping"
                className="img-fluid rounded-4 shadow"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="fw-bold mb-4">Shop by Category</h2>

        <div className="row g-3">
          {categories.map((category) => (
            <div className="col-6 col-md-4 col-lg" key={category}>
              <Link
                to={`/products?category=${encodeURIComponent(category)}`}
                className="category-card"
              >
                {category}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Featured Products</h2>
          <Link to="/products" className="text-primary text-decoration-none">
            View All
          </Link>
        </div>

        <div className="row g-4">
          {products.map((product) => (
            <div className="col-6 col-md-3" key={product.id}>
              <div className="card product-card h-100 border-0 shadow-sm">
                <img
                  src={product.image}
                  className="card-img-top product-image"
                  alt={product.name}
                />

                <div className="card-body">
                  <small className="text-secondary">
                    {product.category}
                  </small>

                  <h6 className="fw-bold mt-2">{product.name}</h6>

                  <h5 className="text-primary">
                    ₹{product.price.toLocaleString("en-IN")}
                  </h5>

                  <Link
                    to="/products"
                    className="btn btn-outline-primary w-100 mt-2"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
