import express from "express";
import { isAdminOrSeller, isVerified } from "../controllers/auth.controller.js";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/create-product", isVerified, isAdminOrSeller, createProduct);
router.get("/getproducts", getProducts);
router.get("/getproduct/:id", getProduct);
router.put("/updateproduct/:id", isVerified, isAdminOrSeller, updateProduct);
router.delete("/deleteproduct/:id", isVerified, isAdminOrSeller, deleteProduct);

export default router;
