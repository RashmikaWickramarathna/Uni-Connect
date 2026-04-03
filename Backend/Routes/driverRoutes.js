const express = require("express");
const router = express.Router();
const driverController = require("../Controllers/driverController");

// CRUD for drivers
router.get("/", driverController.getAllDrivers);           // Get all drivers
router.post("/", driverController.addDriver);              // Add new driver
router.put("/:id", driverController.updateDriver);         // Update driver
router.delete("/:id", driverController.deleteDriver);      // Delete driver

module.exports = router;
