
const express = require("express");
const mongoose = require("mongoose");

const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET: All tasks of logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id
    })
      .populate("subject", "name code")
      .sort({ dueDate: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get Tasks Error:", error);

    res.status(500).json({
      message: "Failed to load tasks"
    });
  }
});

// POST: Create a new task
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      type,
      priority,
      dueDate
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required"
      });
    }

    if (!dueDate || isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({
        message: "Valid due date is required"
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

    const task = await Task.create({
      user: req.user.id,
      title: title.trim(),
      description: description || "",
      subject: subject || null,
      type: type || "Study",
      priority: priority || "Medium",
      dueDate: new Date(dueDate)
    });

    const savedTask = await Task.findById(task._id)
      .populate("subject", "name code");

    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Create Task Error:", error);

    res.status(500).json({
      message: "Could not add task"
    });
  }
});

// PATCH: Toggle task completed/pending
router.patch("/:id/toggle", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    task.completed = !task.completed;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("subject", "name code");

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Toggle Task Error:", error);

    res.status(500).json({
      message: "Could not update task"
    });
  }
});

// DELETE: Delete a task
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error("Delete Task Error:", error);

    res.status(500).json({
      message: "Could not delete task"
    });
  }
});

module.exports = router;
