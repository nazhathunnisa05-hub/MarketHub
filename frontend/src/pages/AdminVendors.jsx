
import { useEffect, useState } from "react";
import api from "../services/api";

function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchVendors = async () => {
    try {
      const response = await api.get("/vendors/pending", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setVendors(response.data.vendors || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to load vendor applications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const reviewVendor = async (vendorId, status) => {
    try {
      await api.patch(
        `/vendors/${vendorId}/review`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(`Vendor application ${status} successfully`);
      fetchVendors();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to review application"
      );
    }
  };

  if (loading) {
    return <div className="container mt-5">Loading applications...</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold">Vendor Management</h2>
      <p className="text-muted">Review vendor applications.</p>

      {message && (
        <div className="alert alert-info">{message}</div>
      )}

      {vendors.length === 0 ? (
        <div className="alert alert-secondary">
          No pending vendor applications.
        </div>
      ) : (
        <div className="row g-4">
          {vendors.map((vendor) => (
            <div className="col-md-6" key={vendor._id}>
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="fw-bold">{vendor.storeName}</h5>

                  <p>
                    <strong>Applicant:</strong>{" "}
                    {vendor.userId?.name || "N/A"}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {vendor.businessEmail}
                  </p>

                  <p>
                    <strong>Description:</strong>{" "}
                    {vendor.description || "No description"}
                  </p>

                  <span className="badge bg-warning text-dark">
                    Pending
                  </span>

                  <div className="mt-3 d-flex gap-2">
                    <button
                      className="btn btn-success"
                      onClick={() =>
                        reviewVendor(vendor._id, "approved")
                      }
                    >
                      Approve
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        reviewVendor(vendor._id, "rejected")
                      }
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminVendors;
