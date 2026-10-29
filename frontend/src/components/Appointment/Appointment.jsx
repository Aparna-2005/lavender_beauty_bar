import React, { useEffect, useState } from "react";
import "./Appointment.css";

const API_URL = "http://127.0.0.1:8000/appointments/";

const SERVICES = [
  "Facial & Skin Care",
  "Hair Care & Styling",
  "Bridal Makeup",
  "Makeup & Glamour",
  "Manicure & Pedicure",
  "Waxing & Threading",
  "Hair Colouring",
  "Spa & Relaxation",
  "Saree Pleating",
];

const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "14:00",
  "14:30", "15:00", "15:30", "16:00",
  "16:30", "17:00", "17:30", "18:00",
  "18:30", "19:00",
];

const initialForm = {
  name: "",
  phone: "",
  email: "",
  service: "",
  date: "",
  time: "",
  message: "",
};

const formatTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";

  return `${hours % 12 || 12}:${String(minutes).padStart(
    2,
    "0"
  )} ${suffix}`;
};

function Appointment({ service, onClose }) {
  const [form, setForm] = useState({
    ...initialForm,
    service: service || "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Local date avoids UTC date mismatches
  const now = new Date();

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  // Lock background scrolling and support Escape key
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      server: "",
      non_field_errors: "",
    }));

    setSuccess("");
  };

  const validate = () => {
    const err = {};

    if (!form.name.trim()) {
      err.name = "Please enter your name.";
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      err.phone = "Enter a valid 10-digit mobile number.";
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      err.email = "Enter a valid email address.";
    }

    if (!SERVICES.includes(form.service)) {
      err.service = "Please select a valid service.";
    }

    if (!form.date || form.date < today) {
      err.date = "Please select today or a future date.";
    }

    if (!TIME_SLOTS.includes(form.time)) {
      err.time = "Please select a valid time.";
    }

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setErrors({});

    const clientErrors = validate();

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Invalid server response (${response.status}).`
        );
      }

      if (!response.ok) {
        const serverErrors = {};

        if (data && typeof data === "object") {
          Object.entries(data).forEach(([key, value]) => {
            serverErrors[key] = Array.isArray(value)
              ? value.join(" ")
              : typeof value === "string"
                ? value
                : JSON.stringify(value);
          });
        }

        if (serverErrors.non_field_errors) {
          serverErrors.time = serverErrors.non_field_errors;
        }

        if (Object.keys(serverErrors).length === 0) {
          serverErrors.server = "Unable to book appointment.";
        }

        setErrors(serverErrors);
        return;
      }

      setSuccess(
        "Appointment booked successfully! We will contact you soon."
      );

      setForm({ ...initialForm });
      setErrors({});
    } catch (err) {
      console.error("Appointment booking error:", err);

      setErrors({
        server:
          err.message ||
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="appointment-overlay"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <aside
        className="appointment-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-title"
      >
        {/* Header */}
        <div className="appointment-header">
          <div>
            <span className="appointment-eyebrow">
              LAVENDER BEAUTY BAR
            </span>

            <h2 id="appointment-title">
              Book Appointment
            </h2>

            <p>Let us take care of your beauty.</p>
          </div>

          <button
            type="button"
            className="appointment-close"
            aria-label="Close appointment form"
            disabled={loading}
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <div className="appointment-content">
          {success && (
            <div className="alert alert-success" role="status">
              <i className="fas fa-check-circle me-2"></i>
              {success}
            </div>
          )}

          {errors.server && (
            <div className="alert alert-danger" role="alert">
              {errors.server}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="mb-3">
              <label
                className="form-label"
                htmlFor="booking-name"
              >
                Full Name *
              </label>

              <input
                id="booking-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`form-control ${
                  errors.name ? "is-invalid" : ""
                }`}
                placeholder="Enter your name"
                autoComplete="name"
              />

              <div className="invalid-feedback">
                {errors.name}
              </div>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label
                className="form-label"
                htmlFor="booking-phone"
              >
                Phone Number *
              </label>

              <input
                id="booking-phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={10}
                inputMode="numeric"
                className={`form-control ${
                  errors.phone ? "is-invalid" : ""
                }`}
                placeholder="10-digit mobile number"
                autoComplete="tel"
              />

              <div className="invalid-feedback">
                {errors.phone}
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label
                className="form-label"
                htmlFor="booking-email"
              >
                Email (optional)
              </label>

              <input
                id="booking-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`form-control ${
                  errors.email ? "is-invalid" : ""
                }`}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <div className="invalid-feedback">
                {errors.email}
              </div>
            </div>

            {/* Service */}
            <div className="mb-3">
              <label
                className="form-label"
                htmlFor="booking-service"
              >
                Beauty Service *
              </label>

              <select
                id="booking-service"
                name="service"
                value={form.service}
                onChange={handleChange}
                className={`form-select ${
                  errors.service ? "is-invalid" : ""
                }`}
              >
                <option value="">Select a service</option>

                {SERVICES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <div className="invalid-feedback">
                {errors.service}
              </div>
            </div>

            {/* Date and time */}
            <div className="row g-3">
              <div className="col-sm-6 mb-3">
                <label
                  className="form-label"
                  htmlFor="booking-date"
                >
                  Appointment Date *
                </label>

                <input
                  id="booking-date"
                  type="date"
                  name="date"
                  min={today}
                  value={form.date}
                  onChange={handleChange}
                  className={`form-control ${
                    errors.date ? "is-invalid" : ""
                  }`}
                />

                <div className="invalid-feedback">
                  {errors.date}
                </div>
              </div>

              <div className="col-sm-6 mb-3">
                <label
                  className="form-label"
                  htmlFor="booking-time"
                >
                  Appointment Time *
                </label>

                <select
                  id="booking-time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className={`form-select ${
                    errors.time ? "is-invalid" : ""
                  }`}
                >
                  <option value="">Select time</option>

                  {TIME_SLOTS.map((item) => (
                    <option key={item} value={item}>
                      {formatTime(item)}
                    </option>
                  ))}
                </select>

                <div className="invalid-feedback">
                  {errors.time}
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <label
                className="form-label"
                htmlFor="booking-message"
              >
                Special Request (optional)
              </label>

              <textarea
                id="booking-message"
                name="message"
                rows="3"
                value={form.message}
                onChange={handleChange}
                className="form-control"
                placeholder="Any special request?"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary rounded-pill w-100 py-3"
              disabled={loading || Boolean(success)}
            >
              {loading
                ? "Booking..."
                : success
                  ? "Appointment Booked"
                  : "Confirm Appointment"}

              {!loading && !success && (
                <i className="fas fa-arrow-right ms-2"></i>
              )}
            </button>

            <p className="appointment-note">
              * Required fields. Your appointment is subject
              to confirmation by our team.
            </p>
          </form>
        </div>
      </aside>
    </div>
  );
}

export default Appointment;