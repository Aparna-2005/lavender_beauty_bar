import React, { useState, useEffect } from "react";
import "./services.css";
import Appointment from "../Appointment/Appointment";

const API_URL = "http://127.0.0.1:8000";

function Services() {
  const isSuperuser = localStorage.getItem("superuser") === "true";

  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // Appointment modal state
  const [showAppointment, setShowAppointment] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    image: null,
  });

  // Fetch services from Django
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_URL}/get_services`);
        const data = await response.json();

        if (
          response.ok &&
          data.success &&
          Array.isArray(data.services)
        ) {
          setServices(data.services);
        } else {
          setServices([]);
          console.error(
            "Unable to fetch services:",
            data.message || response.status
          );
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Clean up temporary image preview
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Open appointment modal on the same page
  const openAppointment = (serviceName) => {
    setSelectedService(serviceName || "");
    setShowAppointment(true);
  };

  const closeAppointment = () => {
    setShowAppointment(false);
  };

  // Handle text inputs and image selection
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files?.[0] || null;

      setFormData((previous) => ({
        ...previous,
        image: file,
      }));

      setImagePreview(file ? URL.createObjectURL(file) : "");
      setError("");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Reset add-service form
  const resetForm = () => {
    setFormData({
      title: "",
      desc: "",
      image: null,
    });

    setImagePreview("");

    const fileInput = document.getElementById("service-image");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const openForm = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    resetForm();
    setError("");
    setShowForm(false);
  };

  // Add service through Django
  const handleAddService = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isSuperuser) {
      setError("Only the administrator can add services.");
      return;
    }

    const title = formData.title.trim();
    const desc = formData.desc.trim();
    const image = formData.image;

    if (!title || !desc || !image) {
      setError("Please enter the service name, description, and image.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(image.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (image.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or less.");
      return;
    }

    const payload = new FormData();
    payload.append("title", title);
    payload.append("desc", desc);
    payload.append("image", image);

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/add_service`, {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || `Unable to add service (${response.status}).`
        );
      }

      if (!data.service) {
        throw new Error("The server did not return the saved service.");
      }

      setServices((previous) => [...previous, data.service]);

      resetForm();
      setShowForm(false);
      setSuccess("Service added successfully!");
    } catch (err) {
      console.error("Add service error:", err);
      setError(err.message || "Unable to connect to Django.");
    } finally {
      setSaving(false);
    }
  };

  // Resolve image URL
  const getImageUrl = (img) => {
    if (!img) return "/img/service-1.jpg";

    if (img.startsWith("http://") || img.startsWith("https://")) {
      return img;
    }

    if (img.startsWith("/")) {
      return img;
    }

    return `/images/services/${img}`;
  };

  return (
    <div className="container-fluid service py-1">
      <div className="container py-5">
        {/* Page heading */}
        <div
          className="text-center mx-auto pb-5"
          style={{ maxWidth: "800px" }}
        >
          <h1 className="display-5 mb-4">Our Beauty Services</h1>

          <p className="mb-0">
            Discover the perfect blend of beauty, care, and relaxation
            at Lavender Beauty Bar.
          </p>

          {isSuperuser && (
            <button
              type="button"
              className="btn btn-primary rounded-pill mt-4"
              onClick={openForm}
            >
              + Add New Service
            </button>
          )}
        </div>

        {/* Success message */}
        {success && (
          <div className="alert alert-success" role="status">
            {success}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-center">Loading services...</p>
        )}

        {/* Empty state */}
        {!loading && services.length === 0 && (
          <p className="text-center">
            No services are available currently.
          </p>
        )}

        {/* Service cards */}
        <div className="row g-4">
          {!loading &&
            services.map((service, index) => (
              <div
                key={service.id ?? `${service.title}-${index}`}
                className="col-md-6 col-lg-4"
              >
                <div className="service-item h-100">
                  <div className="service-img">
                    <img
                      src={getImageUrl(service.img)}
                      className="img-fluid rounded-top w-100"
                      alt={service.title || "Beauty service"}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/img/service-1.jpg";
                      }}
                    />
                  </div>

                  <div className="rounded-bottom p-4">
                    <h4 className="mb-4 text-dark">
                      {service.title}
                    </h4>

                    <p className="mb-4 section-subtitle">
                      {service.desc}
                    </p>

                    {/* IMPORTANT: Button opens modal, not another page */}
                    <button
                      type="button"
                      className="btn btn-primary rounded-pill py-2 px-4"
                      onClick={() =>
                        openAppointment(service.title || "")
                      }
                    >
                      Book services
                      <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Add service popup */}
      {isSuperuser && showForm && (
        <div
          className="service-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="service-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-service-title"
          >
            <div className="service-modal-header">
              <div>
                <h3 id="add-service-title">Add New Service</h3>
                <p className="mb-0">
                  Add a beauty service to Lavender Beauty Bar.
                </p>
              </div>

              <button
                type="button"
                className="service-modal-close"
                aria-label="Close popup"
                disabled={saving}
                onClick={closeForm}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddService}>
              <div className="service-modal-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="service-title" className="form-label">
                    Service Name
                  </label>

                  <input
                    id="service-title"
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="e.g. Hair Spa"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="service-desc" className="form-label">
                    Description
                  </label>

                  <textarea
                    id="service-desc"
                    name="desc"
                    className="form-control"
                    rows="3"
                    placeholder="Enter service description"
                    value={formData.desc}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="service-image" className="form-label">
                    Service Image
                  </label>

                  <input
                    id="service-image"
                    type="file"
                    name="image"
                    className="form-control"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleChange}
                    required
                  />

                  <small className="text-muted">
                    JPG, PNG or WEBP. Maximum size: 5 MB.
                  </small>

                  {imagePreview && (
                    <div className="service-image-preview mt-3">
                      <img src={imagePreview} alt="Service preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="service-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  disabled={saving}
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPOINTMENT MODAL: stays on this Services page */}
      {showAppointment && (
        <Appointment
          service={selectedService}
          onClose={closeAppointment}
        />
      )}
    </div>
  );
}

export default Services;