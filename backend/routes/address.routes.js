import express from "express";

import { isVerified } from "../controllers/auth.controller.js";
import {
  createAddress,
  deleteAddress,
  getAddressWithUserId,
  updateAddress,
  updateAddressWithUserId,
} from "../controllers/address.category.js";

const router = express.Router();

router.post("/create-address", isVerified, createAddress);
router.get("/get-address-with-user-id", isVerified, getAddressWithUserId);
router.put("/update-address/:addressId", isVerified, updateAddress);
router.put(
  "/update-address-with-user-id/",
  isVerified,
  updateAddressWithUserId
);
router.delete("/delete-address/:addressId", isVerified, deleteAddress);

export default router;
