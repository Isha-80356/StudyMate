
import { useEffect, useState } from "react";
import {
  Plus,
  FileText,
  Trash2,
  BookOpen,
  Search,
  X,
} from "lucide-react";

import api from "../services/api";
import "./Notes.css";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setError("");

      const [noteResponse, subjectResponse] = await Promise.all([
        api.get("/notes"),
        api.get("/subjects"),
      ]);

      setNotes(
        Array.isArray(noteResponse.data) ? noteResponse.data : []
      );

      setSubjects(
        Array.isArray(subjectResponse.data)
          ? subjectResponse.data
          : []
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addNote = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a note title.");
      return;
    }

    try {
      const response = await api.post("/notes", {
        title: title.trim(),
        content: content.trim(),
        subject: subject || null,
      });

      setNotes((prev) => [response.data, ...prev]);

      setTitle("");
      setContent("");
      setSubject("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not add note");
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      await api.delete(`/notes/${id}`);

      setNotes((prev) =>
        prev.filter((note) => note._id !== id)
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete note");
    }
  };

  const filteredNotes = notes.filter((note) => {
    const searchText = search.toLowerCase();

    return (
      note.title?.toLowerCase().includes(searchText) ||
      note.content?.toLowerCase().includes(searchText) ||
      note.subject?.name?.toLowerCase().includes(searchText)
    );
  });

  const formatDate = (date) => {
    if (!date) return "Recently added";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently added";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="notes-page">
      {/* Header */}
      <header className="notes-header">
        <div>
          <span className="notes-eyebrow">
            <BookOpen size={15} />
            YOUR KNOWLEDGE SPACE
          </span>

          <h1>My Notes</h1>

          <p>
            Keep your important concepts, ideas, and study materials
            organized in one place.
          </p>
        </div>

        <div className="notes-count-card">
          <div className="notes-count-icon">
            <FileText size={21} />
          </div>

          <div>
            <span>Total Notes</span>
            <h3>{notes.length}</h3>
          </div>
        </div>
      </header>

      {/* Create Note */}
      <section className="notes-create-card">
        <div className="notes-card-heading">
          <div className="notes-heading-icon">
            <Plus size={20} />
          </div>

          <div>
            <h2>Create a new note</h2>
            <p>Capture something important while you study.</p>
          </div>
        </div>

        {error && (
          <div className="notes-error">
            {error}

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form className="notes-form" onSubmit={addNote}>
          <div className="notes-form-row">
            <input
              type="text"
              placeholder="Give your note a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
            />

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">General Note</option>

              {subjects.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Write your study notes here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />

          <div className="notes-form-footer">
            <span>{content.length} characters</span>

            <button className="notes-save-btn" type="submit">
              <Plus size={17} />
              Save Note
            </button>
          </div>
        </form>
      </section>

      {/* Saved Notes */}
      <section className="notes-list-section">
        <div className="notes-list-heading">
          <div>
            <h2>Saved Notes</h2>

            <p>
              {notes.length} {notes.length === 1 ? "note" : "notes"} in
              your collection
            </p>
          </div>

          <div className="notes-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="notes-empty-state">
            <FileText size={30} />
            <p>Loading your notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="notes-empty-state">
            <div className="notes-empty-icon">
              <FileText size={30} />
            </div>

            <h3>
              {search ? "No matching notes" : "Your notes space is empty"}
            </h3>

            <p>
              {search
                ? "Try searching with a different keyword."
                : "Create your first note and start organizing your learning."}
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note, index) => (
              <article className="note-card" key={note._id}>
                <div className="note-card-top">
                  <div className={`note-icon note-icon-${index % 4}`}>
                    <FileText size={20} />
                  </div>

                  <button
                    className="note-delete-btn"
                    type="button"
                    onClick={() => deleteNote(note._id)}
                    title="Delete note"
                    aria-label={`Delete ${note.title}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <h3>{note.title}</h3>

                <span className="note-subject">
                  <BookOpen size={13} />
                  {note.subject?.name || "General"}
                </span>

                <p className="note-content">
                  {note.content || "No content"}
                </p>

                <div className="note-card-footer">
                  <span>
                    Updated {formatDate(note.updatedAt)}
                  </span>

                  <FileText size={15} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}