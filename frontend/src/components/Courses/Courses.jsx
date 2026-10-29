
import React, { useState, useEffect } from "react";
import "./courses.css";

const API_URL = "http://127.0.0.1:8000";

const initialCourseForm = {
  title: "",
  desc: "",
  prize: "",
  duration: "",
};

const initialEnquiryForm = {
  name: "",
  email: "",
  phone: "",
  date: "",
  message: "",
};

function Courses() {
  const isSuperuser = localStorage.getItem("superuser") === "true";

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin course modal
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState(initialCourseForm);

  // Student enquiry modal
  const [showAppointment, setShowAppointment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enquiryData, setEnquiryData] = useState(initialEnquiryForm);
  const [enquiryError, setEnquiryError] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState("");
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  // Fetch courses from Django
  useEffect(() => {
    const fetchCourses = async () => {
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
        console.error("Error fetching courses:", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // ---------------- ADMIN COURSE FORM ----------------

  const handleCourseChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetCourseForm = () => {
    setFormData({ ...initialCourseForm });
  };

  const openCourseForm = () => {
    resetCourseForm();
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeCourseForm = () => {
    if (saving) return;

    setShowForm(false);
    setError("");
    resetCourseForm();
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isSuperuser) {
      setError("Only the administrator can add courses.");
      return;
    }

    const title = formData.title.trim();
    const desc = formData.desc.trim();
    const prize = formData.prize.trim();
    const duration = formData.duration.trim();

    if (!title || !desc || !prize || !duration) {
      setError("Please fill in all course fields.");
      return;
    }

    const payload = new FormData();
    payload.append("title", title);
    payload.append("desc", desc);
    payload.append("prize", prize);
    payload.append("duration", duration);

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/add_course`, {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || `Unable to add course (${response.status}).`
        );
      }

      if (!data.course) {
        throw new Error(
          "The server did not return the saved course."
        );
      }

      setServices((previous) => [...previous, data.course]);
      setShowForm(false);
      resetCourseForm();
      setSuccess("Course added successfully!");
    } catch (err) {
      console.error("Add course error:", err);
      setError(err.message || "Unable to connect to Django.");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- STUDENT ENQUIRY FORM ----------------

  const openAppointment = (courseName) => {
    setSelectedCourse(courseName);
    setEnquiryData({ ...initialEnquiryForm });
    setEnquiryError("");
    setEnquirySuccess("");
    setShowAppointment(true);
  };

  const closeAppointment = () => {
    if (submittingEnquiry) return;

    setShowAppointment(false);
    setEnquiryError("");
    setEnquirySuccess("");
  };

  const handleEnquiryChange = (e) => {
    const { name, value } = e.target;

    setEnquiryData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

const handleEnquirySubmit = async (e) => {
  e.preventDefault();

  setEnquiryError("");
  setEnquirySuccess("");

  if (!enquiryData.name.trim()) {
    setEnquiryError("Please enter your full name.");
    return;
  }

  if (!/^[0-9]{10}$/.test(enquiryData.phone)) {
    setEnquiryError("Please enter a valid 10-digit phone number.");
    return;
  }

  if (!enquiryData.date) {
    setEnquiryError("Please select your preferred joining date.");
    return;
  }

  setSubmittingEnquiry(true);

  try {
    const response = await fetch(
      `${API_URL}/course_enquiry`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_name: selectedCourse,
          student_name: enquiryData.name.trim(),
          phone: enquiryData.phone,
          email: enquiryData.email.trim(),
          joining_date: enquiryData.date,
          message: enquiryData.message.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to submit your enquiry."
      );
    }

    setEnquirySuccess(data.message);

    setEnquiryData({
      name: "",
      email: "",
      phone: "",
      date: "",
      message: "",
    });
  } catch (error) {
    console.error("Course enquiry error:", error);

    setEnquiryError(
      error.message || "Unable to connect to the server."
    );
  } finally {
    setSubmittingEnquiry(false);
  }
};
  const today = new Date();
  const minimumDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <div className="container-fluid service py-1">
      <div className="container py-5">

        {/* Page heading */}
        <div
          className="text-center mx-auto pb-5"
          style={{ maxWidth: "800px" }}
        >
          <h1 className="display-5 mb-4">We Offer Courses</h1>

          <p className="mb-0 text-light">
            Discover your passion for beauty with Lavender Beauty Bar.
            Join our professional beauty courses, learn from experienced
            trainers, and develop the skills to build your future in the
            beauty industry.
          </p>

          {isSuperuser && (
            <button
              type="button"
              className="btn btn-primary rounded-pill mt-4"
              onClick={openCourseForm}
            >
              + Add New Course
            </button>
          )}
        </div>

        {/* Admin success message */}
        {success && (
          <div className="alert alert-success" role="status">
            {success}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-center">Loading courses...</p>
        )}

        {/* Empty state */}
        {!loading && services.length === 0 && (
          <p className="text-center">
            No courses are available currently.
          </p>
        )}

        {/* Course cards */}
        <div className="row g-4">
          {!loading &&
            services.map((service, index) => (
              <div
                key={service.id ?? `${service.title}-${index}`}
                className="col-md-6 col-lg-4"
              >
                <div className="service-item h-100">
                  <div className="rounded-bottom p-4">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <h4 className="text-dark">
                        {service.title}
                      </h4>

                      <h5 className="section-subtitle mb-3">
                        {service.prize}
                      </h5>
                    </div>

                    <p className="section-subtitle mb-2">
                      {service.desc}
                    </p>

                    {service.duration && (
                      <p className="course-duration mb-3">
                        <i className="far fa-clock me-2"></i>
                        {service.duration}
                      </p>
                    )}

                    <button
                      type="button"
                      className="course-explore-btn"
                      onClick={() =>
                        openAppointment(service.title || "")
                      }
                    >
                      Explore Courses
                      <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ---------------- ADMIN ADD COURSE MODAL ---------------- */}

      {isSuperuser && showForm && (
        <div
          className="service-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeCourseForm();
            }
          }}
        >
          <div
            className="service-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-course-title"
          >
            <div className="service-modal-header">
              <div>
                <h3 id="add-course-title">Add New Course</h3>
                <p className="mb-0">
                  Add a course to Lavender Beauty Bar.
                </p>
              </div>

              <button
                type="button"
                className="service-modal-close"
                aria-label="Close modal"
                disabled={saving}
                onClick={closeCourseForm}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCourse}>
              <div className="service-modal-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="course-title" className="form-label">
                    Course Name
                  </label>
                  <input
                    id="course-title"
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="e.g. Mehandhi"
                    value={formData.title}
                    onChange={handleCourseChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="course-desc" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="course-desc"
                    name="desc"
                    className="form-control"
                    rows="3"
                    placeholder="Enter course description"
                    value={formData.desc}
                    onChange={handleCourseChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="course-prize" className="form-label">
                    Price
                  </label>
                  <input
                    id="course-prize"
                    type="text"
                    name="prize"
                    className="form-control"
                    placeholder="e.g. ₹1000"
                    value={formData.prize}
                    onChange={handleCourseChange}
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
                    placeholder="e.g. 2 months"
                    value={formData.duration}
                    onChange={handleCourseChange}
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              <div className="service-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  disabled={saving}
                  onClick={closeCourseForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- RIGHT-SIDE ENQUIRY MODAL ---------------- */}

      {showAppointment && (
        <div
          className="course-enquiry-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeAppointment();
            }
          }}
        >
          <aside
            className="course-enquiry-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-title"
          >
            {/* Modal header */}
            <div className="course-enquiry-header">
              <div>
                <span className="course-enquiry-eyebrow">
                  LAVENDER BEAUTY BAR
                </span>

                <h3 id="enquiry-title">Course Enquiry</h3>

                <p>
                  Begin your beauty journey with us.
                </p>
              </div>

              <button
                type="button"
                className="course-enquiry-close"
                aria-label="Close enquiry form"
                disabled={submittingEnquiry}
                onClick={closeAppointment}
              >
                &times;
              </button>
            </div>

            {/* Form body */}
            <div className="course-enquiry-body">
              {enquirySuccess ? (
                <div className="course-enquiry-success" role="status">
                  <i className="fas fa-check-circle"></i>
                  <h4>Thank You!</h4>
                  <p>{enquirySuccess}</p>

                  <button
                    type="button"
                    className="course-submit-btn"
                    onClick={closeAppointment}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit}>
                  {enquiryError && (
                    <div className="alert alert-danger" role="alert">
                      {enquiryError}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="enquiry-course">
                      Selected Course
                    </label>
                    <input
                      id="enquiry-course"
                      type="text"
                      className="form-control"
                      value={selectedCourse}
                      readOnly
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="enquiry-name">
                      Full Name *
                    </label>
                    <input
                      id="enquiry-name"
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Enter your full name"
                      value={enquiryData.name}
                      onChange={handleEnquiryChange}
                      maxLength={100}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="enquiry-email">
                      Email Address *
                    </label>
                    <input
                      id="enquiry-email"
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Enter your email address"
                      value={enquiryData.email}
                      onChange={handleEnquiryChange}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="enquiry-phone">
                      Phone Number *
                    </label>
                    <input
                      id="enquiry-phone"
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="10-digit mobile number"
                      value={enquiryData.phone}
                      onChange={handleEnquiryChange}
                      pattern="[0-9]{10}"
                      maxLength={10}
                      inputMode="numeric"
                      autoComplete="tel"
                      title="Enter a 10-digit phone number"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="enquiry-date">
                      Preferred Joining Date
                    </label>
                    <input
                      id="enquiry-date"
                      type="date"
                      name="date"
                      className="form-control"
                      min={minimumDate}
                      value={enquiryData.date}
                      onChange={handleEnquiryChange}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="enquiry-message">
                      Message
                    </label>
                    <textarea
                      id="enquiry-message"
                      name="message"
                      className="form-control"
                      rows="3"
                      placeholder="Tell us what you would like to know"
                      value={enquiryData.message}
                      onChange={handleEnquiryChange}
                      maxLength={1000}
                    />
                  </div>

                  <button
                    type="submit"
                    className="course-submit-btn"
                    disabled={submittingEnquiry}
                  >
                    {submittingEnquiry
                      ? "Submitting..."
                      : "Submit Enquiry"}

                    <i className="fas fa-arrow-right ms-2"></i>
                  </button>

                  <p className="course-enquiry-note">
                    Our team can help you with course details and
                    joining information.
                  </p>
                </form>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Courses;
