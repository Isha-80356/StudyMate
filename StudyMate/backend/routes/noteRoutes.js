
const express = require("express");
const mongoose = require("mongoose");

const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET: Load all notes of logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user.id
    })
      .populate("subject", "name code")
      .sort({ updatedAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    console.error("Get Notes Error:", error);

    res.status(500).json({
      message: "Failed to load notes"
    });
  }
});

// POST: Create a new note
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, subject } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Note title is required"
      });
    }

    if (
      subject &&
      !mongoose.Types.ObjectId.isValid(subject)
    ) {
      return res.status(400).json({
        message: "Invalid subject ID"
      });
    }

    const note = await Note.create({
      user: req.user.id,
      title: title.trim(),
      content: content || "",
      subject: subject || null
    });

    const savedNote = await Note.findById(note._id)
      .populate("subject", "name code");

    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Create Note Error:", error);

    res.status(500).json({
      message: "Could not save note"
    });
  }
});

// DELETE: Delete a note
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    res.status(200).json({
      message: "Note deleted successfully"
    });
  } catch (error) {
    console.error("Delete Note Error:", error);

    res.status(500).json({
      message: "Could not delete note"
    });
  }
});

module.exports = router;
