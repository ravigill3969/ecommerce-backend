import express from "express";
import {
  createOrder,
  getMyOrders,
  updateOrder,
} from "../controllers/order.controller.js";
import { isVerified } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/create-order", isVerified, createOrder);
router.get("/get-orders", isVerified, getMyOrders);
router.put("/update-order/:id", isVerified, updateOrder);

export default router;
