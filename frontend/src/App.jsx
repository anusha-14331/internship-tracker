import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import "./App.css";

function PrivateRoute({ children }) {
  const { ready, isAuthenticated } = useAuth();
  if (!ready) {
    return (
      <div className="auth-page">
        <p className="loading-inline">Loading…</p>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { ready, isAuthenticated } = useAuth();
  if (!ready) {
    return (
      <div className="auth-page">
        <p className="loading-inline">Loading…</p>
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
