import express from "express";
import {
  createOrder,
  deleteOrder,
  getMyOrders,
  updateOrder,
} from "../controllers/order.controller.js";
import { isVerified } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/create-order", isVerified, createOrder);
router.get("/get-orders", isVerified, getMyOrders);
router.put("/update-order/:id", isVerified, updateOrder);
router.delete("/delete-order/:id", isVerified, deleteOrder);

export default router;
