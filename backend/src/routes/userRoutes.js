const express = require("express");

const router = express.Router();

const {
  createUser,
  getAllUsers,
  getStaffUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

router.post("/create", protect, authorizeRoles("admin"), createUser);

router.get("/staff", protect, authorizeRoles("admin", "manager"), getStaffUsers);

router.get("/", protect, authorizeRoles("admin"), getAllUsers);

router.get("/:id", protect, authorizeRoles("admin"), getSingleUser);

router.put("/:id", protect, authorizeRoles("admin"), updateUser);

router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

module.exports = router;
