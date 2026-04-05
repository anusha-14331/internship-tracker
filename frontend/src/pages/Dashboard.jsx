import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { dateAndTimeToIso, formatDeadline, isoToDateAndTime } from "../utils/dateTime.js";
import "../App.css";

export default function Dashboard() {
  const { user, logout, ready } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState({ type: "", text: "" });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    deadlineDate: "",
    deadlineTime: "",
    status: "pending",
  });

  const showBanner = useCallback((type, text) => {
    setBanner({ type, text });
    if (text) {
      window.setTimeout(() => setBanner({ type: "", text: "" }), 5000);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch (err) {
      const msg = err.response?.data?.message || "Could not load tasks.";
      showBanner("error", msg);
      if (err.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate, showBanner]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    loadTasks();
  }, [ready, user, navigate, loadTasks]);

  async function handleAddTask(e) {
    e.preventDefault();
    if (!title.trim() || !deadlineDate) {
      showBanner("error", "Title and deadline date are required.");
      return;
    }
    setSaving(true);
    try {
      const deadlineIso = dateAndTimeToIso(deadlineDate, deadlineTime);
      if (!deadlineIso) {
        showBanner("error", "Please choose a valid deadline date.");
        setSaving(false);
        return;
      }
      const { data } = await api.post("/tasks", {
        title: title.trim(),
        description: description.trim(),
        deadline: deadlineIso,
      });
      setTasks((prev) => [...prev, data].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)));
      setTitle("");
      setDescription("");
      setDeadlineDate("");
      setDeadlineTime("");
      showBanner("success", "Task added.");
    } catch (err) {
      showBanner("error", err.response?.data?.message || "Could not add task.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(task) {
    const { date, time } = isoToDateAndTime(task.deadline);
    setEditingId(task._id);
    setEditForm({
      title: task.title,
      description: task.description || "",
      deadlineDate: date,
      deadlineTime: time,
      status: task.status,
    });
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      const deadlineIso = dateAndTimeToIso(editForm.deadlineDate, editForm.deadlineTime);
      if (!deadlineIso) {
        showBanner("error", "Please choose a valid deadline date.");
        setSaving(false);
        return;
      }
      const { data } = await api.put(`/tasks/${editingId}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        deadline: deadlineIso,
        status: editForm.status,
      });
      setTasks((prev) =>
        prev.map((t) => (t._id === data._id ? data : t)).sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      );
      setEditingId(null);
      showBanner("success", "Task updated.");
    } catch (err) {
      showBanner("error", err.response?.data?.message || "Could not update task.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      if (editingId === id) setEditingId(null);
      showBanner("success", "Task deleted.");
    } catch (err) {
      showBanner("error", err.response?.data?.message || "Could not delete task.");
    }
  }

  async function toggleComplete(task) {
    const next = task.status === "completed" ? "pending" : "completed";
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { status: next });
      setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
      showBanner("success", next === "completed" ? "Marked complete." : "Marked pending.");
    } catch (err) {
      showBanner("error", err.response?.data?.message || "Could not update status.");
    }
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status === "pending").length;

  if (!ready || !user) {
    return (
      <div className="app-main">
        <p className="loading-inline">Loading…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/dashboard" className="app-brand">
          Internship Tracker
        </Link>
        <div className="app-header-actions">
          <span className="app-user">{user.fullName || user.name}</span>
          <button type="button" className="btn btn-secondary btn-small" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>

      <main className="app-main">
        <h1 className="dashboard-title">Dashboard</h1>

        {banner.text && (
          <div
            className={banner.type === "error" ? "alert alert-error" : "alert alert-success"}
            role="status"
          >
            {banner.text}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card total">
            <h3>Total tasks</h3>
            <div className="value">{loading ? "—" : total}</div>
          </div>
          <div className="stat-card completed">
            <h3>Completed</h3>
            <div className="value">{loading ? "—" : completed}</div>
          </div>
          <div className="stat-card pending">
            <h3>Pending</h3>
            <div className="value">{loading ? "—" : pending}</div>
          </div>
        </div>

        <section className="task-form-card" aria-labelledby="add-task-heading">
          <h2 id="add-task-heading" className="section-title">
            Add new task
          </h2>
          <form onSubmit={handleAddTask}>
            <div className="form-group">
              <label htmlFor="new-title">Title</label>
              <input
                id="new-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Submit weekly report"
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-desc">Description</label>
              <textarea
                id="new-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details"
              />
            </div>
            <div className="form-row deadline-row">
              <div className="form-group">
                <label htmlFor="new-deadline-date">Deadline date</label>
                <input
                  id="new-deadline-date"
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-deadline-time">Time (optional)</label>
                <input
                  id="new-deadline-time"
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                />
                <small className="form-hint">If you only pick a date, we use 5:00 PM.</small>
              </div>
              <div className="form-group deadline-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    "Add task"
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        <h2 className="section-title">Your tasks</h2>

        {loading ? (
          <p className="loading-inline">
            <span className="spinner" style={{ verticalAlign: "middle", marginRight: "0.5rem" }} />
            Loading tasks…
          </p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">No tasks yet. Add one above to get started.</div>
        ) : (
          <div className="task-list">
            {tasks.map((task) =>
              editingId === task._id ? (
                <div key={task._id} className="task-card">
                  <form onSubmit={saveEdit} style={{ width: "100%" }}>
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        rows={2}
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      />
                    </div>
                    <div className="form-row deadline-row">
                      <div className="form-group">
                        <label htmlFor="edit-deadline-date">Deadline date</label>
                        <input
                          id="edit-deadline-date"
                          type="date"
                          value={editForm.deadlineDate}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, deadlineDate: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-deadline-time">Time (optional)</label>
                        <input
                          id="edit-deadline-time"
                          type="time"
                          value={editForm.deadlineTime}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, deadlineTime: e.target.value }))
                          }
                        />
                        <small className="form-hint">Defaults to 5:00 PM if empty.</small>
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-status">Status</label>
                        <select
                          id="edit-status"
                          value={editForm.status}
                          onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <div className="task-actions">
                      <button type="submit" className="btn btn-primary btn-small" disabled={saving}>
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div
                  key={task._id}
                  className={`task-card ${task.status === "completed" ? "completed" : ""}`}
                >
                  <div>
                    <span
                      className={`badge ${task.status === "completed" ? "badge-done" : "badge-pending"}`}
                    >
                      {task.status === "completed" ? "Done" : "Pending"}
                    </span>
                    <h3 className="task-title">{task.title}</h3>
                    {task.description ? <p className="task-desc">{task.description}</p> : null}
                    <p className="task-meta">Deadline: {formatDeadline(task.deadline)}</p>
                  </div>
                  <div className="task-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => toggleComplete(task)}
                    >
                      {task.status === "completed" ? "Mark pending" : "Mark complete"}
                    </button>
                    <button type="button" className="btn btn-secondary btn-small" onClick={() => startEdit(task)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => deleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
