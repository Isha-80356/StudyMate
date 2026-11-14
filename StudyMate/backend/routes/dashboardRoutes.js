const express = require("express");
const Subject = require("../models/Subjects");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Dashboard statistics
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const totalSubjects = await Subject.countDocuments({
      user: req.user.id
    });

    res.json({
      totalSubjects,
      totalTasks: 0,
      completedTasks: 0,
      totalNotes: 0
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      message: "Failed to load dashboard data"
    });
  }
});

module.exports = router;