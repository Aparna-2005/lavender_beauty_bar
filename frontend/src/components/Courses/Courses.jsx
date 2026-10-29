
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./courses.css";

const API_URL = "http://127.0.0.1:8000";

function Courses() {
  const isSuperuser = localStorage.getItem("superuser") === "true";

  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    image: null,
  });

  // Fetch services from Django.
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_URL}/get_courses`);
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
            "Unable to fetch courses:",
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

  // Handle text inputs and image selection.
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {

      setFormData((previous) => ({
        ...previous,
      }));

      setError("");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Reset form fields.
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

  // Open popup.
  const openForm = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Close popup.
  const closeForm = () => {
    if (saving) return;

    resetForm();
    setError("");
    setShowForm(false);
  };

  // Add service using Django API.
  const handleAddService = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isSuperuser) {
      setError("Only the administrator can add courses.");
      return;
    }

    const title = formData.title.trim();
    const desc = formData.desc.trim();
    const prize = formData.prize;
    const duration = formData.duration;

    if (!title || !desc || !prize || !duration) {
      setError("Please enter the course name, description, prize, and duration.");
      return;
    }


    const payload = new FormData();
    payload.append("title", title);
    payload.append("desc", desc);
    payload.append("prize", prize);
    payload.append("duration", duration);

    console.log("Data : ", payload)
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/add_course`, {
        method: "POST",
        body: payload,
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Invalid server response (${response.status}).`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || `Unable to add course (${response.status}).`
        );
      }

      if (!data.course) {
        throw new Error("The server did not return the saved course.");
      }

      // Add the saved course to the existing array.
      setServices((previous) => [
        ...(Array.isArray(previous) ? previous : []),
        data.course,
      ]);

      resetForm();
      setShowForm(false);
      setSuccess("Course added successfully!");
    } catch (err) {
      console.error("Add course error:", err);
      setError(err.message || "Unable to connect to Django.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="container-fluid service py-1">
      <div className="container py-5">

        {/* Page heading */}
        <div
          className="text-center mx-auto pb-5"
          style={{ maxWidth: "800px" }}
        >
          <h1 className="display-5 mb-4">We offered courses</h1>

          <p className="mb-0 text-light">
            Discover your passion for beauty with Lavender Beauty Bar. Join our professional beauty courses, learn from experienced trainers, and develop the skills to build your future in the beauty industry.
          </p>

          {isSuperuser && (
            <button
              type="button"
              className="btn btn-primary rounded-pill mt-4"
              onClick={openForm}
            >
              + Add New Courses
            </button>
          )}
        </div>

        {/* Success message */}
        {success && (
          <div className="alert alert-success" role="status">
            {success}
          </div>
        )}

        {/* Loading message */}
        {loading && (
          <p className="text-center">Loading services...</p>
        )}

        {/* Empty state */}
        {!loading && services.length === 0 && (
          <p className="text-center">
            No courses are available currently.
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

                  <div className="rounded-bottom p-4">
                    <h4 className="mb-4 text-dark">
                      {service.title}
                    </h4>

                    <p className="mb-4 section-subtitle">
                      {service.desc}
                    </p>

                    <Link
                      className=" rounded-pill text-secondary"
                      to={`/appointment?service=${encodeURIComponent(
                        service.title || ""
                      )}`}
                    > 
                      Explore courses 
                      <i className="fas fa-arrow-right px-2"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Add service popup modal */}
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
            {/* Modal header */}
            <div className="service-modal-header">
              <div>
                <h3 id="add-service-title">Add New Course</h3>
                <p className="mb-0">
                  Add a course to Lavender Beauty Bar.
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

            {/* Modal form */}
            <form onSubmit={handleAddService}>
              <div className="service-modal-body">

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label
                    htmlFor="service-title"
                    className="form-label"
                  >
                    Course Name
                  </label>

                  <input
                    id="course-title"
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="e.g. Mehandhi"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="service-desc"
                    className="form-label"
                  >
                    Description
                  </label>

                  <textarea
                    id="service-desc"
                    name="desc"
                    className="form-control"
                    rows="2"
                    placeholder="Enter service description"
                    value={formData.desc}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="course-prize"
                    className="form-label"
                  >
                    Prize
                  </label>

                  <input
                    id="course-prize"
                    type="text"
                    name="prize"
                    className="form-control"
                    placeholder="e.g. 1000"
                    value={formData.prize}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="course-duration"
                    className="form-label"
                  >
                    Duration
                  </label>

                  <input
                    id="course-duration"
                    type="text"
                    name="duration"
                    className="form-control"
                    placeholder="e.g. 2 hours"
                    value={formData.duration}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              {/* Modal footer */}
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
    </div>
  );
}

export default Courses;
