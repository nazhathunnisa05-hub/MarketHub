import { useEffect, useState } from "react";
import api from "../services/api";

function ProductReviews({ productId, orderId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/${productId}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Review loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const submitReview = async (e) => {
    e.preventDefault();

    if (!orderId) {
      alert("A delivered order is required to submit a review.");
      return;
    }

    try {
      await api.post(
        "/reviews",
        {
          productId,
          orderId,
          rating: Number(rating),
          comment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Review submitted successfully!");
      setComment("");
      setRating(5);
      fetchReviews();
    } catch (error) {
      alert(
        error.response?.data?.message || "Unable to submit review"
      );
    }
  };

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="mt-4">
      <h4>Customer Reviews</h4>

      <h5>
        ⭐ {reviews.averageRating || 0} / 5
        <small className="text-muted ms-2">
          ({reviews.totalReviews || 0} reviews)
        </small>
      </h5>

      {orderId && (
        <div className="card p-3 my-3">
          <h5>Write a Review</h5>

          <form onSubmit={submitReview}>
            <label className="form-label">Rating</label>

            <select
              className="form-select mb-3"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} Stars
                </option>
              ))}
            </select>

            <label className="form-label">Your Comment</label>

            <textarea
              className="form-control mb-3"
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              required
            />

            <button className="btn btn-primary" type="submit">
              Submit Review
            </button>
          </form>
        </div>
      )}

      {reviews.reviews?.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.reviews?.map((review) => (
          <div className="border-bottom py-3" key={review._id}>
            <strong>
              {review.customerId?.name || "Customer"}
            </strong>

            <p className="mb-1">
              {"⭐".repeat(review.rating)}
            </p>

            <p>{review.comment}</p>

            <small className="text-muted">
              {new Date(review.createdAt).toLocaleDateString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

export default ProductReviews;