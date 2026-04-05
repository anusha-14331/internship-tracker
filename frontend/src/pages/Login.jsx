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
  return err.message || "Login failed. Please try again.";
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);
    try {
      await login(email, password);
      setMessage({ type: "success", text: "Welcome back!" });
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
        <h1>Sign in</h1>
        <p className="auth-sub">Student Internship Tracker</p>

        {message.text && message.type === "error" && (
          <div className="alert alert-error" role="alert">
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
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
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
