
const express = require("express");
const Subject = require("../models/Subjects");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all subjects of logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const subjects = await Subject.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Add new subject
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, code, instructor } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Subject name and code are required"
      });
    }

    const subject = await Subject.create({
      user: req.user.id,
      name: name.trim(),
      code: code.trim(),
      instructor: instructor || ""
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Delete subject
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found"
      });
    }

    res.status(200).json({
      message: "Subject deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
