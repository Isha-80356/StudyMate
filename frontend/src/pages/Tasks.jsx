
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Trash2,
  CalendarDays,
  Clock3,
  BookOpen,
  X,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import "./Tasks.css";

const API = "http://localhost:5000/api";

const taskTypes = ["Assignment", "Exam", "Study", "Project"];
const priorities = ["Low", "Medium", "High"];

function getToken() {
  return localStorage.getItem("token");
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

function getSubjectName(subject, subjects) {
  if (subject && typeof subject === "object") {
    return subject.name || "General";
  }

  return subjects.find((item) => item._id === subject)?.name || "General";
}

function formatDate(date) {
  if (!date) return "No due date";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "No due date";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;

  const due = new Date(task.dueDate);
  const today = new Date();

  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return due < today;
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    type: "Assignment",
    priority: "Medium",
    dueDate: "",
  });

  useEffect(() => {
    fetchTasks();
    fetchSubjects();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/tasks`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load tasks");
      }

      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (err) {
      setError(err.message || "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubjects() {
    try {
      const response = await fetch(`${API}/subjects`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setSubjects(Array.isArray(data) ? data : data.subjects || []);
      }
    } catch (err) {
      console.error("Subjects loading error:", err);
    }
  }

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function addTask(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        subject: form.subject || undefined,
        type: form.type,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
      };

      const response = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add task");
      }

      const createdTask = data.task || data;

      setTasks((previous) => [createdTask, ...previous]);
      setForm({
        title: "",
        description: "",
        subject: "",
        type: "Assignment",
        priority: "Medium",
        dueDate: "",
      });
      setShowModal(false);
    } catch (err) {
      setError(err.message || "Could not create task.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(taskId) {
    try {
      const response = await fetch(`${API}/tasks/${taskId}/toggle`, {
        method: "PATCH",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update task");
      }

      const updatedTask = data.task || data;

      setTasks((previous) =>
        previous.map((task) =>
          task._id === taskId
            ? {
                ...task,
                completed:
                  typeof updatedTask.completed === "boolean"
                    ? updatedTask.completed
                    : !task.completed,
              }
            : task
        )
      );
    } catch (err) {
      setError(err.message || "Could not update task.");
    }
  }

  async function deleteTask(taskId) {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/tasks/${taskId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      setTasks((previous) => previous.filter((task) => task._id !== taskId));
    } catch (err) {
      setError(err.message || "Could not delete task.");
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const title = task.title?.toLowerCase() || "";
      const description = task.description?.toLowerCase() || "";
      const subjectName = getSubjectName(task.subject, subjects).toLowerCase();
      const searchText = search.toLowerCase();

      const matchesSearch =
        title.includes(searchText) ||
        description.includes(searchText) ||
        subjectName.includes(searchText);

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Pending" && !task.completed) ||
        (activeFilter === "Completed" && task.completed);

      return matchesSearch && matchesFilter;
    });
  }, [tasks, subjects, search, activeFilter]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <div className="tasks-eyebrow">
            <ClipboardList size={15} />
            YOUR PRODUCTIVITY SPACE
          </div>

          <h1>My Tasks</h1>
          <p>Stay organized, focus on your goals, and get things done.</p>
        </div>

        <button
          className="tasks-add-button"
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
        >
          <Plus size={19} />
          Add New Task
        </button>
      </div>

      {error && (
        <div className="tasks-error">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Close error">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="tasks-summary">
        <div className="tasks-summary-card">
          <div className="tasks-summary-icon purple">
            <ClipboardList size={21} />
          </div>
          <div>
            <span>Total Tasks</span>
            <h2>{totalTasks}</h2>
          </div>
        </div>

        <div className="tasks-summary-card">
          <div className="tasks-summary-icon orange">
            <Clock3 size={21} />
          </div>
          <div>
            <span>Pending</span>
            <h2>{pendingTasks}</h2>
          </div>
        </div>

        <div className="tasks-summary-card">
          <div className="tasks-summary-icon green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Completed</span>
            <h2>{completedTasks}</h2>
          </div>
        </div>

        <div className="tasks-summary-card tasks-progress-card">
          <div className="tasks-progress-top">
            <span>Completion Rate</span>
            <strong>{completionRate}%</strong>
          </div>
          <div className="tasks-progress-track">
            <div
              className="tasks-progress-fill"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <small>Keep going — you're making progress!</small>
        </div>
      </div>

      <div className="tasks-toolbar">
        <div className="tasks-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search tasks or subjects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="tasks-filter-tabs">
          {["All", "Pending", "Completed"].map((filter) => (
            <button
              key={filter}
              className={activeFilter === filter ? "active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="tasks-list-heading">
        <div>
          <h2>Task Overview</h2>
          <p>{filteredTasks.length} tasks found</p>
        </div>
      </div>

      {loading ? (
        <div className="tasks-empty">
          <div className="tasks-empty-icon">
            <Clock3 size={28} />
          </div>
          <h3>Loading your tasks...</h3>
          <p>Please wait a moment.</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="tasks-empty">
          <div className="tasks-empty-icon">
            <ClipboardList size={28} />
          </div>
          <h3>No tasks found</h3>
          <p>
            {search || activeFilter !== "All"
              ? "Try changing your search or filter."
              : "Create your first task and start organizing your study."}
          </p>
          {!search && activeFilter === "All" && (
            <button
              className="tasks-empty-button"
              onClick={() => setShowModal(true)}
            >
              <Plus size={17} />
              Create a task
            </button>
          )}
        </div>
      ) : (
        <div className="tasks-list">
          {filteredTasks.map((task) => (
            <div
              className={`task-card ${task.completed ? "is-completed" : ""}`}
              key={task._id}
            >
              <button
                className="task-check-button"
                onClick={() => toggleTask(task._id)}
                aria-label={task.completed ? "Mark as pending" : "Complete task"}
              >
                {task.completed ? (
                  <CheckCircle2 size={23} />
                ) : (
                  <Circle size={23} />
                )}
              </button>

              <div className="task-card-content">
                <div className="task-card-title-row">
                  <h3>{task.title}</h3>

                  <span
                    className={`task-priority priority-${(
                      task.priority || "Medium"
                    ).toLowerCase()}`}
                  >
                    {task.priority || "Medium"} Priority
                  </span>
                </div>

                {task.description && <p>{task.description}</p>}

                <div className="task-card-meta">
                  <span className="task-subject">
                    <BookOpen size={14} />
                    {getSubjectName(task.subject, subjects)}
                  </span>

                  <span className="task-type">{task.type || "Study"}</span>

                  <span
                    className={`task-due-date ${
                      isOverdue(task) ? "overdue" : ""
                    }`}
                  >
                    <CalendarDays size={14} />
                    {isOverdue(task)
                      ? `Overdue · ${formatDate(task.dueDate)}`
                      : formatDate(task.dueDate)}
                  </span>
                </div>
              </div>

              <button
                className="task-delete-button"
                onClick={() => deleteTask(task._id)}
                aria-label="Delete task"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="tasks-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="tasks-modal">
            <div className="tasks-modal-header">
              <div>
                <span className="tasks-modal-kicker">PLAN YOUR WORK</span>
                <h2>Create a New Task</h2>
                <p>Add details to keep your study plan on track.</p>
              </div>

              <button
                className="tasks-modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addTask}>
              <label>
                Task Title <span>*</span>
                <input
                  type="text"
                  placeholder="e.g. Complete CN assignment"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  placeholder="Add a few details about this task..."
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                />
              </label>

              <div className="tasks-form-grid">
                <label>
                  Subject
                  <select
                    value={form.subject}
                    onChange={(event) =>
                      updateForm("subject", event.target.value)
                    }
                  >
                    <option value="">General / No subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Task Type
                  <select
                    value={form.type}
                    onChange={(event) => updateForm("type", event.target.value)}
                  >
                    {taskTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      updateForm("priority", event.target.value)
                    }
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Due Date
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      updateForm("dueDate", event.target.value)
                    }
                  />
                </label>
              </div>

              <div className="tasks-modal-actions">
                <button
                  type="button"
                  className="tasks-cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="tasks-submit-button"
                  disabled={saving}
                >
                  <Plus size={17} />
                  {saving ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
