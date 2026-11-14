const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    code: {
      type: String,
      required: true
    },

    instructor: {
      type: String,
      default: ""
    },

    color: {
      type: String,
      default: "#64748b"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);