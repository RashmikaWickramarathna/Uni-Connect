const express = require("express");
const router = express.Router();
const deliveryController = require("../Controllers/deliveryController");

router.get("/orders", deliveryController.getPendingOrders);
router.post("/accept/:id", deliveryController.acceptOrder);
router.post("/reject/:id", deliveryController.rejectOrder);
router.get("/all", deliveryController.getAllDeliveries);

module.exports = router;
