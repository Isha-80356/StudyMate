
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Search,
  X,
  BookOpen,
  ListTodo,
  FileText,
  CalendarDays,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const API = "http://localhost:5000/api";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const closeDropdowns = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearch(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", closeDropdowns);

    return () => {
      document.removeEventListener("mousedown", closeDropdowns);
    };
  }, []);

  useEffect(() => {
    const loadSearchResults = async () => {
      if (search.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setLoadingSearch(true);

        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [subjectsRes, tasksRes, notesRes] = await Promise.all([
          fetch(`${API}/subjects`, { headers }),
          fetch(`${API}/tasks`, { headers }),
          fetch(`${API}/notes`, { headers }),
        ]);

        const subjects = subjectsRes.ok ? await subjectsRes.json() : [];
        const tasks = tasksRes.ok ? await tasksRes.json() : [];
        const notes = notesRes.ok ? await notesRes.json() : [];

        const query = search.toLowerCase();

        const results = [
          ...(Array.isArray(subjects) ? subjects : [])
            .filter((item) =>
              `${item.name} ${item.code || ""}`
                .toLowerCase()
                .includes(query)
            )
            .map((item) => ({
              id: item._id,
              title: item.name,
              subtitle: item.code || "Subject",
              type: "subject",
              icon: BookOpen,
              path: "/subjects",
            })),

          ...(Array.isArray(tasks) ? tasks : [])
            .filter((item) =>
              `${item.title} ${item.description || ""}`
                .toLowerCase()
                .includes(query)
            )
            .map((item) => ({
              id: item._id,
              title: item.title,
              subtitle: item.type || "Task",
              type: "task",
              icon: ListTodo,
              path: "/tasks",
            })),

          ...(Array.isArray(notes) ? notes : [])
            .filter((item) =>
              `${item.title} ${item.content || ""}`
                .toLowerCase()
                .includes(query)
            )
            .map((item) => ({
              id: item._id,
              title: item.title,
              subtitle: "Study Note",
              type: "note",
              icon: FileText,
              path: "/notes",
            })),
        ];

        setSearchResults(results.slice(0, 8));
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    };

    loadSearchResults();
  }, [search]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const tasks = await response.json();

        if (!Array.isArray(tasks)) return;

        const now = new Date();

        const upcoming = tasks
          .filter((task) => !task.completed && task.dueDate)
          .map((task) => ({
            ...task,
            due: new Date(task.dueDate),
          }))
          .filter((task) => task.due >= new Date(now.setHours(0, 0, 0, 0)))
          .sort((a, b) => a.due - b.due)
          .slice(0, 5);

        setNotifications(upcoming);
      } catch (error) {
        console.error("Notification error:", error);
      }
    };

    loadNotifications();
  }, []);

  const openResult = (result) => {
    setSearch("");
    setShowSearch(false);
    navigate(result.path);
  };

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <header className="top-navbar">
      <div className="navbar-search-wrapper" ref={searchRef}>
        <div className={`navbar-search ${showSearch ? "focused" : ""}`}>
          <Search size={18} />

          <input
            type="text"
            value={search}
            placeholder="Search subjects, tasks, notes..."
            onFocus={() => setShowSearch(true)}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowSearch(true);
            }}
          />

          {search && (
            <button
              className="navbar-clear-search"
              onClick={() => {
                setSearch("");
                setSearchResults([]);
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}

          <span className="search-shortcut">⌘ K</span>
        </div>

        {showSearch && search.trim().length >= 2 && (
          <div className="navbar-dropdown search-dropdown">
            <div className="dropdown-topline">
              <span>SEARCH RESULTS</span>
              <span>{searchResults.length} found</span>
            </div>

            {loadingSearch ? (
              <div className="navbar-dropdown-empty">
                Searching your study space...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="navbar-dropdown-empty">
                <Search size={23} />
                <p>No results found</p>
                <span>Try another keyword.</span>
              </div>
            ) : (
              <div className="search-results-list">
                {searchResults.map((result) => {
                  const Icon = result.icon;

                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      className="navbar-search-result"
                      onClick={() => openResult(result)}
                    >
                      <div className={`search-result-icon ${result.type}`}>
                        <Icon size={18} />
                      </div>

                      <div className="search-result-info">
                        <strong>{result.title}</strong>
                        <span>{result.subtitle}</span>
                      </div>

                      <ArrowUpRight size={16} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right">
        <div
          className="navbar-notification-wrapper"
          ref={notificationRef}
        >
          <button
            className={`notification-btn ${
              showNotifications ? "notification-active" : ""
            }`}
            title="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowSearch(false);
            }}
          >
            <Bell size={20} />

            {notifications.length > 0 && (
              <span className="notification-count">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="navbar-dropdown notification-dropdown">
              <div className="notification-heading">
                <div>
                  <h3>Notifications</h3>
                  <p>Your upcoming study activities</p>
                </div>

                <span className="notification-heading-icon">
                  <Bell size={18} />
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="navbar-dropdown-empty">
                  <CalendarDays size={25} />
                  <p>You're all caught up!</p>
                  <span>No upcoming tasks.</span>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map((task) => (
                    <button
                      className="notification-item"
                      key={task._id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/tasks");
                      }}
                    >
                      <div className="notification-icon">
                        <CalendarDays size={17} />
                      </div>

                      <div className="notification-info">
                        <strong>{task.title}</strong>
                        <span>
                          {task.subject?.name || "Study task"}
                        </span>
                        <small>
                          Due {formatDate(task.dueDate)}
                        </small>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button
                className="notification-footer"
                onClick={() => {
                  setShowNotifications(false);
                  navigate("/tasks");
                }}
              >
                View all tasks <ArrowUpRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-avatar">{userInitial}</div>

          <div className="navbar-user-info">
            <strong>{user?.name || "Student"}</strong>
            <span>My Account</span>
          </div>

          <ChevronDown size={15} className="user-chevron" />
        </div>
      </div>
    </header>
  );
}
