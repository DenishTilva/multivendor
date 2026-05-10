const express = require("express");

const router = express.Router();

const {
  createTask,
  getAllTasks,
  updateTaskStatus,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("manager"), createTask);

router.get(
  "/",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  getAllTasks,
);

router.put("/:id", protect, authorizeRoles("staff"), updateTaskStatus);

module.exports = router;
