import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import "./Styles.css";

const API_URL = "http://127.0.0.1:8000";
const DEFAULT_OTP_LIFETIME_MS = 5 * 60 * 1000; // fallback if backend sends no expiry

// Zod validation schema
const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),

  rememberMe: z.boolean(),
});

// Formik validation using Zod
const validateLogin = (values) => {
  const result = LoginSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  const errors = {};

  result.error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  });

  return errors;
};

// Work out when the OTP expires, based on whatever the backend returns
const getOtpExpiry = (data) => {
  const fromServer =
    data.otp_expires_at ||
    data.otp_session_time ||
    data.expires_at;

  if (fromServer && !Number.isNaN(new Date(fromServer).getTime())) {
    return new Date(fromServer).toISOString();
  }

  if (typeof data.expires_in === "number") {
    return new Date(Date.now() + data.expires_in * 1000).toISOString();
  }

  return new Date(Date.now() + DEFAULT_OTP_LIFETIME_MS).toISOString();
};

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const handleLogin = async (values, { setSubmitting }) => {
    setServerError("");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setServerError(data.message || "Invalid email or password");
        return;
      }

      const otpSessionTime = getOtpExpiry(data);

      // Persist the OTP challenge (survives a refresh on the OTP page)
      sessionStorage.setItem("otp_user_id", String(data.user_id));
      sessionStorage.setItem("otp_email", data.email || values.email.trim());
      sessionStorage.setItem("otp_sessionTime", otpSessionTime);
      sessionStorage.setItem("otp_remember", String(values.rememberMe));

      navigate("/Mfa_otp", {
        state: {
          userId: String(data.user_id),
          email: data.email || values.email.trim(),
          otpSessionTime,
          rememberMe: values.rememberMe,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      setServerError("Unable to connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Log In</h2>

        <p className="auth-subtitle">
          Welcome back! Please enter your details.
        </p>

        {serverError && (
          <div className="auth-server-error" role="alert">
            {serverError}
          </div>
        )}

        <Formik
          initialValues={{
            email: "",
            password: "",
            rememberMe: false,
          }}
          validate={validateLogin}
          onSubmit={handleLogin}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form noValidate>
              {/* Email */}
              <div className="auth-group">
                <label className="auth-label" htmlFor="email">
                  Email
                </label>

                <Field
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`auth-input ${
                    errors.email && touched.email ? "is-invalid" : ""
                  }`}
                />

                <ErrorMessage
                  name="email"
                  component="div"
                  className="auth-error"
                />
              </div>

              {/* Password */}
              <div className="auth-group">
                <label className="auth-label" htmlFor="password">
                  Password
                </label>

                <Field
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`auth-input ${
                    errors.password && touched.password ? "is-invalid" : ""
                  }`}
                />

                <ErrorMessage
                  name="password"
                  component="div"
                  className="auth-error"
                />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="auth-row">
                <label className="auth-check" htmlFor="rememberMe">
                  <Field id="rememberMe" type="checkbox" name="rememberMe" />
                  Remember me
                </label>

                <Link to="/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="auth-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/signin" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}