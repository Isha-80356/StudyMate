import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";
import "./Planner.css";

export default function Planner() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/tasks");

        const sortedTasks = [...response.data].sort(
          (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
        );

        setTasks(sortedTasks);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load planner"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const groupedTasks = useMemo(() => {
    return tasks.reduce((groups, task) => {
      const date = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "No due date";

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(task);

      return groups;
    }, {});
  }, [tasks]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="planner-page">
      <div className="planner-header">
        <div>
          <span className="planner-eyebrow">
            YOUR STUDY ORGANIZATION
          </span>

          <h1>Study Planner</h1>

          <p>
            Keep your assignments, deadlines, and study schedule
            organized in one place.
          </p>
        </div>

        <div className="planner-header-icon">
          <CalendarDays size={34} />
        </div>
      </div>

      <div className="planner-overview">
        <div className="planner-overview-card">
          <div className="planner-overview-icon total">
            <ListTodo size={21} />
          </div>

          <div>
            <span>Total Tasks</span>
            <h2>{tasks.length}</h2>
          </div>
        </div>

        <div className="planner-overview-card">
          <div className="planner-overview-icon completed">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Completed</span>
            <h2>{completedTasks}</h2>
          </div>
        </div>

        <div className="planner-overview-card">
          <div className="planner-overview-icon pending">
            <Clock size={21} />
          </div>

          <div>
            <span>Pending</span>
            <h2>{pendingTasks}</h2>
          </div>
        </div>
      </div>

      <section className="planner-schedule-card">
        <div className="planner-section-header">
          <div>
            <h2>
              <CalendarDays size={21} />
              Upcoming Schedule
            </h2>

            <p>Tasks arranged according to their due dates.</p>
          </div>

          <span className="planner-task-count">
            {tasks.length} Tasks
          </span>
        </div>

        {error && (
          <div className="planner-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="planner-empty">
            <div className="planner-loading"></div>
            <p>Loading your schedule...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="planner-empty">
            <div className="planner-empty-icon">
              <CalendarDays size={32} />
            </div>

            <h3>Your planner is empty</h3>

            <p>
              Add tasks from the Tasks page to see your schedule here.
            </p>
          </div>
        ) : (
          <div className="planner-timeline">
            {Object.entries(groupedTasks).map(([date, dateTasks]) => (
              <div className="planner-date-group" key={date}>
                <div className="planner-date-heading">
                  <div className="planner-date-icon">
                    <CalendarDays size={18} />
                  </div>

                  <h3>{date}</h3>

                  <span>{dateTasks.length} tasks</span>
                </div>

                <div className="planner-task-list">
                  {dateTasks.map((task) => (
                    <div
                      className={`planner-task-item ${
                        task.completed ? "is-completed" : ""
                      }`}
                      key={task._id}
                    >
                      <div
                        className={`planner-task-icon ${
                          task.completed ? "completed" : "pending"
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle2 size={21} />
                        ) : (
                          <Clock size={21} />
                        )}
                      </div>

                      <div className="planner-task-details">
                        <h4>{task.title}</h4>

                        <p>
                          {task.subject?.name || task.type || "General"}
                          <span> · </span>
                          {task.priority || "Normal"} Priority
                        </p>
                      </div>

                      <span
                        className={`planner-status-badge ${
                          task.completed ? "done" : "pending"
                        }`}
                      >
                        {task.completed ? "Completed" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}