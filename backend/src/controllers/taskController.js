const Task = require("../models/Task");

const createTask = async (req, res) => {
  try {
    const { heading, description, assignedTo, dueDate } = req.body;

    const task = await Task.create({
      heading,
      description,
      assignedBy: req.user._id,
      assignedTo,
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find()
        .populate("assignedBy", "name email role")
        .populate("assignedTo", "name email role");
    } else if (req.user.role === "manager") {
      tasks = await Task.find({
        assignedBy: req.user._id,
      }).populate("assignedTo", "name email role");
    } else if (req.user.role === "staff") {
      tasks = await Task.find({
        assignedTo: req.user._id,
      }).populate("assignedBy", "name email role");
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status, completionReason } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.status = status;

    if (completionReason) {
      task.completionReason = completionReason;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  updateTaskStatus,
};
