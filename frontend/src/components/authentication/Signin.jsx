
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import "./Styles.css";

// Zod validation schema
const SigninSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .refine((value) => value.length >= 2, {
        message: "Name must be at least 2 characters",
      }),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

// Formik validation using Zod
const validateSignin = (values) => {
  const result = SigninSchema.safeParse(values);

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

// Reusable form field
function FormField({
  name,
  label,
  type = "text",
  placeholder,
  errors,
  touched,
}) {
  return (
    <div className="auth-group">
      <label className="auth-label" htmlFor={name}>
        {label}
      </label>

      <Field
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`auth-input ${
          errors[name] && touched[name] ? "is-invalid" : ""
        }`}
      />

      <ErrorMessage
        name={name}
        component="div"
        className="auth-error"
      />
    </div>
  );
}

export default function Signin() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const handleSignin = async (values, { setSubmitting }) => {
    setServerError("");

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name.trim(),
            email: values.email.trim(),
            password: values.password,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      console.log("Server response:", data);

      if (!res.ok) {
        setServerError(
          data.message || "Signup failed. Please try again."
        );
        return;
      }

      alert("Account created successfully!");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Registration error:", error);

      setServerError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card wide">
        <h2 className="auth-title">Create Account</h2>

        <p className="auth-subtitle">
          Fill in your details to get started.
        </p>

        {serverError && (
          <div className="auth-server-error" role="alert">
            {serverError}
          </div>
        )}

        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validate={validateSignin}
          onSubmit={handleSignin}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form noValidate>
              <FormField
                name="name"
                label="Full Name"
                placeholder="Your name"
                errors={errors}
                touched={touched}
              />

              <FormField
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                errors={errors}
                touched={touched}
              />

              <FormField
                name="password"
                label="Password"
                type="password"
                placeholder="Create password"
                errors={errors}
                touched={touched}
              />

              <FormField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                errors={errors}
                touched={touched}
              />

              <button
                type="submit"
                className="auth-btn"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Creating account..."
                  : "Sign Up"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}