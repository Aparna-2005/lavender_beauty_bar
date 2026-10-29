
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import "./Styles.css";

const API_URL = "http://127.0.0.1:8000";

const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
  rememberMe: z.boolean(),
});

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

const getOtpExpiry = (data) => {
  const fromServer =
    data.otp_expires_at ||
    data.otp_session_time ||
    data.otp_sessionTime ||
    data.expires_at;

  if (fromServer) {
    const parsedDate = new Date(fromServer);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  }

  if (
    typeof data.expires_in === "number" &&
    Number.isFinite(data.expires_in) &&
    data.expires_in > 0
  ) {
    return new Date(
      Date.now() + data.expires_in * 1000
    ).toISOString();
  }

  // Fallback: backend OTP lifetime is 5 minutes.
  return new Date(
    Date.now() + 5 * 60 * 1000
  ).toISOString();
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

      // Required for Django session authentication.
      // credentials: "include",

      body: JSON.stringify({
        email: values.email.trim(),
        password: values.password,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      setServerError(
        data.message || "Invalid email or password."
      );
      return;
    }

    // ---------------------------------------
    // ADMIN LOGIN: BYPASS OTP
    // ---------------------------------------
    if (data.role === "admin") {
      // Store role and superuser permission flag.
      localStorage.setItem("role", "admin");

      localStorage.setItem( "superuser", String(data.superuser === true));

      localStorage.setItem( "is_staff",String(data.is_staff === true));

      localStorage.setItem("user_id", String(data.user_id));

      localStorage.setItem("username", data.username || "");

      localStorage.setItem("email", data.email || values.email.trim());

      // Clear any previous OTP challenge.
      sessionStorage.removeItem("otp_user_id");
      sessionStorage.removeItem("otp_email");
      sessionStorage.removeItem("otp_sessionTime");
      sessionStorage.removeItem("otp_remember");

      // Redirect admin to home.
      navigate("/home", {
        replace: true,
        state: {
          userId: data.user_id,
          username: data.username,
          email: data.email,
          superuser: data.superuser === true,
        },
      });

      return;
    }

    // ---------------------------------------
    // NORMAL USER: REQUIRE OTP
    // ---------------------------------------
    if (data.role === "user" && data.user_id != null) {
      // Do not retain previous admin privileges.
      localStorage.removeItem("superuser");
      localStorage.setItem("role", "user");
      localStorage.removeItem("is_staff");

      const otpSessionTime = getOtpExpiry(data);
      const userEmail = data.email || values.email.trim();

      sessionStorage.setItem("otp_user_id", String(data.user_id) );
      sessionStorage.setItem("otp_email", userEmail );
      sessionStorage.setItem( "otp_sessionTime", otpSessionTime );
      sessionStorage.setItem( "otp_remember", String(values.rememberMe));

      navigate("/Mfa_otp", {
        replace: true,
        state: {
          userId: String(data.user_id),
          email: userEmail,
          otpSessionTime,
          rememberMe: values.rememberMe,
        },
      });

      return;
    }
    setServerError("Unexpected response from server.");
  } catch (error) {
    setServerError( "Unable to connect to the server. Please try again." );
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
              <div className="auth-group">
                <label className="auth-label" htmlFor="email" > Email </label>

                <Field
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`auth-input ${
                    errors.email && touched.email
                      ? "is-invalid"
                      : ""
                  }`}
                />

                <ErrorMessage
                  name="email"
                  component="div"
                  className="auth-error"
                />
              </div>

              <div className="auth-group">
                <label
                  className="auth-label"
                  htmlFor="password"
                >
                  Password
                </label>

                <Field
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`auth-input ${
                    errors.password && touched.password
                      ? "is-invalid"
                      : ""
                  }`}
                />

                <ErrorMessage
                  name="password"
                  component="div"
                  className="auth-error"
                />
              </div>

              <div className="auth-row">
                <label
                  className="auth-check"
                  htmlFor="rememberMe"
                >
                  <Field
                    id="rememberMe"
                    type="checkbox"
                    name="rememberMe"
                  />
                  Remember me
                </label>

                <Link
                  to="/forgot-password"
                  className="auth-link"
                >
                  Forgot password?
                </Link>
              </div>

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
