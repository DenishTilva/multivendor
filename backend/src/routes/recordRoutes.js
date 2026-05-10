const express = require("express");

const router = express.Router();

const {
  createRecord,
  getAllRecords,
  getSingleRecord,
  updateRecord,
  deleteRecord,
} = require("../controllers/recordController");

const { protect } = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("admin", "manager"), createRecord);

router.get(
  "/",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  getAllRecords,
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  getSingleRecord,
);

router.put("/:id", protect, authorizeRoles("admin", "manager"), updateRecord);

router.delete("/:id", protect, authorizeRoles("admin"), deleteRecord);

module.exports = router;
