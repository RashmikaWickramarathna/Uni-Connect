const express = require("express");
const router = express.Router();
const inventoryController = require("../Controllers/inventoryController");

router.get("/", inventoryController.getAllInventory);
router.post("/", inventoryController.createInventoryItem);
router.put("/:id", inventoryController.updateInventoryItem);
router.delete("/:id", inventoryController.deleteInventoryItem);

module.exports = router;
