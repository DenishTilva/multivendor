const Record = require("../models/Record");

const checkPermissions = require("../utils/checkPermissions");

const createRecord = async (req, res) => {
  try {
    let data = req.body;

    if (req.user.role === "manager") {
      data = checkPermissions(req.user.permissions, req.body);
    }

    const record = await Record.create({
      ...data,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Record created successfully",
      record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllRecords = async (req, res) => {
  try {
    const records = await Record.find().populate(
      "createdBy",
      "name email role",
    );

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateRecord = async (req, res) => {
  try {
    let data = req.body;

    if (req.user.role === "manager") {
      data = checkPermissions(req.user.permissions, req.body);
    }

    const updatedRecord = await Record.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Record updated successfully",
      record: updatedRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteRecord = async (req, res) => {
  try {
    await Record.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRecord,
  getAllRecords,
  getSingleRecord,
  updateRecord,
  deleteRecord,
};
