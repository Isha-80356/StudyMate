
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  StickyNote,
  CalendarDays,
  Settings,
  LogOut,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "My Subjects",
    path: "/subjects",
    icon: BookOpen,
  },
  {
    label: "My Tasks",
    path: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "My Notes",
    path: "/notes",
    icon: StickyNote,
  },
  {
    label: "Study Planner",
    path: "/planner",
    icon: CalendarDays,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <PanelLeftOpen size={20} />
      </button>

      {mobileOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={`studymate-sidebar ${
          collapsed ? "sidebar-collapsed" : ""
        } ${mobileOpen ? "sidebar-mobile-open" : ""}`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <GraduationCap size={24} />
          </div>

          {!collapsed && (
            <div className="sidebar-brand-text">
              <h2>StudyMate</h2>
              <span>Your study companion</span>
            </div>
          )}

          <button
            className="sidebar-mobile-close"
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-section-label">
          {!collapsed && "WORKSPACE"}
        </div>

        <nav className="sidebar-navigation">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMobileSidebar}
                title={collapsed ? item.label : ""}
              >
                <Icon size={19} strokeWidth={2} />

                {!collapsed && <span>{item.label}</span>}

                {!collapsed && item.path === "/tasks" && (
                  <span className="sidebar-nav-dot" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-section-label">
            {!collapsed && "PREFERENCES"}
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `sidebar-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
            title={collapsed ? "Settings" : ""}
          >
            <Settings size={19} />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() ||
                user?.username?.charAt(0)?.toUpperCase() ||
                "S"}
            </div>

            {!collapsed && (
              <div className="sidebar-user-info">
                <strong>
                  {user?.name || user?.username || "Student"}
                </strong>
                <span>Student Account</span>
              </div>
            )}

            <button
              className="sidebar-logout-button"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>

          <button
            className="sidebar-collapse-button"
            onClick={() => setCollapsed((previous) => !previous)}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}

            {!collapsed && <span>Collapse sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
