import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../App.css";

function getErrorMessage(err) {
  const msg = err.response?.data?.message;
  if (typeof msg === "string" && msg.trim()) return msg;
  if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
    return "Cannot reach the server. Start the API (e.g. npm run dev in backend) and check the URL.";
  }
  return err.message || "Registration failed. Please try again.";
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const nameTrim = fullName.trim();
    const emailTrim = email.trim();
    if (!nameTrim || !emailTrim || !password) {
      setMessage({ type: "error", text: "Please fill in full name, email, and password." });
      return;
    }

    setLoading(true);
    try {
      await register(nameTrim, emailTrim, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-sub">Start tracking your internship tasks</p>

        {message.text && message.type === "error" && (
          <div className="alert alert-error" role="alert">
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <small style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
              At least 6 characters
            </small>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden />
                Creating account…
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
