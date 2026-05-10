const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      default: "",
    },

    subCategory: {
      type: String,
      default: "",
    },

    shortDescription: {
      type: String,
      default: "",
    },

    fullDescription: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Record", recordSchema);
