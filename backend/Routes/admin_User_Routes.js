const express = require("express");
const router = express.Router();
const { getUsers, addUser, updateUser, deleteUser } = require("../controllers/admin_User_Controller");

const collections = [
  "users",
  "TableReservation",
  "OrderManagement",
  "MenuManagement",
  "InventoryManagement",
  "InquiryManagement",
  "FeedbackManagement",
  "DeliveryManagement",
];

collections.forEach((collection) => {
  router.get(`/${collection}`, getUsers(collection));
  router.post(`/${collection}`, addUser(collection));
  router.put(`/${collection}/:id`, updateUser(collection));
  router.delete(`/${collection}/:id`, deleteUser(collection));
});

module.exports = router;
