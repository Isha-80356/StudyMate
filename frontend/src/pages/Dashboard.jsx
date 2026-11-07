
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListTodo,
  Plus,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
  GraduationCap,
  Target,
  Sparkles,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
    upcomingTasks: [],
  });

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsRes, subjectsRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/subjects"),
        ]);

        if (!isMounted) return;

        // Dashboard statistics
        const statsData = statsRes.data || {};

        setStats({
          totalTasks: Number(statsData.totalTasks) || 0,
          completedTasks: Number(statsData.completedTasks) || 0,
          pendingTasks: Number(statsData.pendingTasks) || 0,
          completionRate: Math.min(
            Math.max(Number(statsData.completionRate) || 0, 0),
            100
          ),
          upcomingTasks: Array.isArray(statsData.upcomingTasks)
            ? statsData.upcomingTasks
            : [],
        });

        // Subjects response can be an array or an object
        const subjectsData = subjectsRes.data;

        const subjectList = Array.isArray(subjectsData)
          ? subjectsData
          : Array.isArray(subjectsData?.subjects)
          ? subjectsData.subjects
          : [];

        setSubjects(subjectList);
      } catch (err) {
        console.error("Dashboard loading error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load dashboard. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [location.key]);

  const cards = [
    {
      title: "Total Subjects",
      value: subjects.length,
      icon: BookOpen,
      color: "purple",
      subtitle: "Your enrolled subjects",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: ListTodo,
      color: "blue",
      subtitle: "Assignments & activities",
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: "green",
      subtitle: "Tasks finished",
    },
    {
      title: "Pending",
      value: stats.pendingTasks,
      icon: Clock3,
      color: "orange",
      subtitle: "Tasks to complete",
    },
  ];

  const formatDate = (date) => {
    if (!date) return "No due date";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "No due date";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const getPriority = (priority) => {
    const value = priority?.toLowerCase() || "medium";

    return ["high", "medium", "low"].includes(value)
      ? value
      : "medium";
  };

  return (
    <div className="study-dashboard">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div>
          <span className="dashboard-date">
            <CalendarDays size={15} />
            YOUR LEARNING OVERVIEW
          </span>

          <h1>Dashboard</h1>

          <p>Welcome back! Let’s make today productive.</p>
        </div>

        <button
          className="dashboard-add-btn"
          onClick={() => navigate("/tasks")}
        >
          <Plus size={18} />
          Add New Task
        </button>
      </header>

      {/* Welcome Banner */}
      <section className="dashboard-welcome">
        <div className="welcome-content">
          <span className="welcome-tag">
            <Sparkles size={14} />
            YOUR PERSONAL STUDY SPACE
          </span>

          <h2>Make today count.</h2>

          <p>
            Stay focused, organize your work, and keep moving
            toward your goals.
          </p>

          <button
            className="welcome-action"
            onClick={() => navigate("/tasks")}
          >
            View My Tasks
            <ArrowUpRight size={17} />
          </button>
        </div>

        <div className="welcome-decoration">
          <div className="decoration-circle circle-one" />
          <div className="decoration-circle circle-two" />

          <div className="welcome-book">
            <GraduationCap size={76} />
          </div>
        </div>
      </section>

      {/* Overview Stats */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Overview</h2>
            <p>A quick look at your study progress</p>
          </div>

          <span className="overview-period">All time</span>
        </div>

        <div className="dashboard-stats">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div className="stat-card" key={card.title}>
                <div className={`stat-icon ${card.color}`}>
                  <Icon size={21} />
                </div>

                <div className="stat-card-top">
                  <span>{card.title}</span>
                  <MoreHorizontal size={19} />
                </div>

                <h3>{loading ? "—" : card.value}</h3>

                <p>{card.subtitle}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Progress and Upcoming Tasks */}
      <div className="dashboard-content-grid">
        {/* Study Progress */}
        <section className="dashboard-panel progress-panel">
          <div className="panel-heading">
            <div>
              <h2>Study Progress</h2>
              <p>Keep up your learning momentum</p>
            </div>

            <div className="panel-heading-icon">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="progress-summary">
            <div>
              <span className="progress-label">Completion rate</span>

              <h3>
                {loading ? "—" : `${stats.completionRate}%`}
              </h3>

              <p className="progress-small-text">
                Tasks completed so far
              </p>
            </div>

            <div className="progress-circle">
              <svg viewBox="0 0 100 100">
                <circle
                  className="progress-circle-bg"
                  cx="50"
                  cy="50"
                  r="40"
                />

                <circle
                  className="progress-circle-value"
                  cx="50"
                  cy="50"
                  r="40"
                  style={{
                    strokeDasharray: `${
                      (stats.completionRate / 100) * 251.2
                    } 251.2`,
                  }}
                />
              </svg>

              <span>
                {loading ? "—" : `${stats.completionRate}%`}
              </span>
            </div>
          </div>

          <div className="progress-bar">
            <div
              style={{
                width: `${stats.completionRate}%`,
              }}
            />
          </div>

          <div className="progress-footer">
            <span>
              <CheckCircle2 size={15} />
              {stats.completedTasks} completed
            </span>

            <span>{stats.pendingTasks} remaining</span>
          </div>
        </section>

        {/* Upcoming Tasks */}
        <section className="dashboard-panel upcoming-panel">
          <div className="panel-heading">
            <div>
              <h2>Upcoming Tasks</h2>
              <p>What’s on your schedule?</p>
            </div>

            <button
              className="text-action"
              onClick={() => navigate("/tasks")}
            >
              View all
              <ArrowUpRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="empty-dashboard">
              Loading tasks...
            </div>
          ) : stats.upcomingTasks.length === 0 ? (
            <div className="empty-dashboard">
              <CheckCircle2 size={30} />

              <h3>All caught up!</h3>

              <p>No upcoming tasks at the moment.</p>

              <button
                className="small-action-btn"
                onClick={() => navigate("/tasks")}
              >
                <Plus size={16} />
                Add a task
              </button>
            </div>
          ) : (
            <div className="upcoming-list">
              {stats.upcomingTasks.slice(0, 4).map((task, index) => (
                <div
                  className="upcoming-task"
                  key={task._id || task.id || index}
                >
                  <div className="task-date-box">
                    <span>{formatDate(task.dueDate)}</span>
                  </div>

                  <div className="upcoming-task-info">
                    <h4>{task.title || "Untitled task"}</h4>

                    <span>
                      {task.subject?.name || "General Study"}
                    </span>
                  </div>

                  <span
                    className={`priority-tag ${getPriority(
                      task.priority
                    )}`}
                  >
                    {task.priority || "Medium"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* My Subjects */}
      <section className="dashboard-panel subjects-panel">
        <div className="panel-heading">
          <div>
            <h2>My Subjects</h2>
            <p>Your current learning subjects</p>
          </div>

          <button
            className="text-action"
            onClick={() => navigate("/subjects")}
          >
            View all
            <ArrowUpRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="empty-dashboard">
            Loading subjects...
          </div>
        ) : subjects.length === 0 ? (
          <div className="empty-dashboard">
            <BookOpen size={30} />

            <h3>No subjects added yet</h3>

            <p>
              Add your subjects to organize your study schedule.
            </p>

            <button
              className="small-action-btn"
              onClick={() => navigate("/subjects")}
            >
              <Plus size={16} />
              Add Subject
            </button>
          </div>
        ) : (
          <div className="subjects-grid">
            {subjects.slice(0, 4).map((subject, index) => (
              <div
                className="subject-card"
                key={subject._id || subject.id || index}
              >
                <div
                  className={`subject-card-icon subject-color-${
                    index % 4
                  }`}
                >
                  <BookOpen size={21} />
                </div>

                <div className="subject-card-menu">
                  <MoreHorizontal size={19} />
                </div>

                <h3>{subject.name || "Untitled Subject"}</h3>

                <p>{subject.code || "Study Subject"}</p>

                <div className="subject-card-footer">
                  <span>
                    {subject.instructor || "Your instructor"}
                  </span>

                  <ArrowUpRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Error message */}
      {error && (
        <div className="dashboard-error">
          <Target size={18} />
          {error}
        </div>
      )}

      {/* Footer */}
      <footer className="dashboard-footer">
        <span>StudyMate</span>
        <span>Organize your learning. Achieve your goals.</span>
      </footer>
    </div>
  );
}
