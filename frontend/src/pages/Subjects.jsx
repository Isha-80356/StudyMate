
import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  X,
  Trash2,
  GraduationCap,
  UserRound,
  Hash,
  ArrowUpRight,
  BookMarked,
} from "lucide-react";
import "./Subjects.css";

const API = "http://localhost:5000/api";

const colors = ["purple", "blue", "green", "orange", "pink", "cyan"];

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    code: "",
    instructor: "",
    color: "purple",
  });

  const getToken = () => localStorage.getItem("token");

  const loadSubjects = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API}/subjects`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load subjects.");
      }

      const data = await response.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleAddSubject = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Subject name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API}/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim(),
          instructor: form.instructor.trim(),
          color: form.color,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add subject.");
      }

      setSubjects((previous) => [data, ...previous]);
      setForm({
        name: "",
        code: "",
        instructor: "",
        color: "purple",
      });
      setShowModal(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/subjects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Unable to delete subject.");
      }

      setSubjects((previous) =>
        previous.filter((subject) => subject._id !== id)
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    `${subject.name} ${subject.code || ""} ${subject.instructor || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="subjects-page">
      <div className="subjects-header">
        <div>
          <div className="subjects-eyebrow">
            <BookMarked size={15} />
            YOUR LEARNING LIBRARY
          </div>

          <h1>My Subjects</h1>
          <p>Organize your courses and keep your learning on track.</p>
        </div>

        <button
          className="subjects-add-button"
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
        >
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      <div className="subjects-hero">
        <div className="subjects-hero-content">
          <span>YOUR ACADEMIC SPACE</span>
          <h2>Learn something new every day.</h2>
          <p>
            Keep all your subjects in one place. Stay organized,
            focused, and ready for your next achievement.
          </p>
        </div>

        <div className="subjects-hero-art">
          <div className="subjects-art-circle">
            <GraduationCap size={65} />
          </div>
        </div>
      </div>

      <div className="subjects-overview">
        <div className="subjects-overview-icon">
          <BookOpen size={22} />
        </div>

        <div>
          <span>Total Subjects</span>
          <h2>{subjects.length}</h2>
        </div>

        <div className="subjects-overview-note">
          <span>YOUR CURRENT COURSES</span>
          <p>All your learning materials, organized.</p>
        </div>
      </div>

      <div className="subjects-toolbar">
        <div>
          <h2>All Subjects</h2>
          <p>
            {filteredSubjects.length}{" "}
            {filteredSubjects.length === 1 ? "subject" : "subjects"} found
          </p>
        </div>

        <div className="subjects-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button onClick={() => setSearch("")}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {error && !showModal && (
        <div className="subjects-error">{error}</div>
      )}

      {loading ? (
        <div className="subjects-empty">
          <BookOpen size={35} />
          <h3>Loading subjects...</h3>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="subjects-empty">
          <div className="subjects-empty-icon">
            <BookOpen size={32} />
          </div>
          <h3>{search ? "No subjects found" : "Your learning space is empty"}</h3>
          <p>
            {search
              ? "Try searching with another keyword."
              : "Add your first subject and start organizing your studies."}
          </p>

          {!search && (
            <button
              className="subjects-add-button"
              onClick={() => setShowModal(true)}
            >
              <Plus size={17} />
              Add Your First Subject
            </button>
          )}
        </div>
      ) : (
        <div className="subjects-card-grid">
          {filteredSubjects.map((subject, index) => {
            const color =
              subject.color && colors.includes(subject.color)
                ? subject.color
                : colors[index % colors.length];

            return (
              <div
                className={`subject-detail-card ${color}`}
                key={subject._id}
              >
                <div className="subject-card-top">
                  <div className="subject-detail-icon">
                    <BookOpen size={23} />
                  </div>

                  <button
                    className="subject-delete-button"
                    title="Delete subject"
                    onClick={() => handleDeleteSubject(subject._id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="subject-detail-content">
                  <span className="subject-code">
                    {subject.code || "COURSE"}
                  </span>

                  <h3>{subject.name}</h3>

                  <div className="subject-instructor">
                    <UserRound size={15} />
                    <span>
                      {subject.instructor || "Instructor not added"}
                    </span>
                  </div>
                </div>

                <div className="subject-detail-footer">
                  <span>My Learning</span>
                  <ArrowUpRight size={17} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div
          className="subjects-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="subjects-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="subjects-modal-header">
              <div>
                <div className="subjects-modal-icon">
                  <BookOpen size={22} />
                </div>
                <h2>Add New Subject</h2>
                <p>Enter the details of your course.</p>
              </div>

              <button
                className="subjects-modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAddSubject}>
              <label>Subject Name *</label>
              <div className="subjects-form-field">
                <BookOpen size={17} />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Computer Networks"
                  required
                />
              </div>

              <label>Subject Code</label>
              <div className="subjects-form-field">
                <Hash size={17} />
                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. 23CSP-301"
                />
              </div>

              <label>Instructor</label>
              <div className="subjects-form-field">
                <UserRound size={17} />
                <input
                  name="instructor"
                  value={form.instructor}
                  onChange={handleChange}
                  placeholder="Instructor name"
                />
              </div>

              <label>Card Color</label>
              <div className="subjects-color-picker">
                {colors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    className={`color-choice ${color} ${
                      form.color === color ? "selected" : ""
                    }`}
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        color,
                      }))
                    }
                    aria-label={color}
                  />
                ))}
              </div>

              {error && <div className="subjects-form-error">{error}</div>}

              <div className="subjects-modal-actions">
                <button
                  type="button"
                  className="subjects-cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="subjects-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Subject"}
                  {!saving && <Plus size={17} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
