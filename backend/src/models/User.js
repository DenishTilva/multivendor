const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    category: {
      type: Boolean,
      default: false,
    },
    subCategory: {
      type: Boolean,
      default: false,
    },
    shortDescription: {
      type: Boolean,
      default: false,
    },
    fullDescription: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "manager", "staff", "user"],
      default: "user",
    },

    permissions: {
      type: permissionSchema,
      default: () => ({}),
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
