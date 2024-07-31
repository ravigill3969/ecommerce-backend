import express from "express";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { isAdmin, isVerified } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/create", isVerified, isAdmin, createCategory);
router.get("/getcategories", getCategories);
router.get("/getcategory/:id", getCategory);
router.put("/updatecategory/:id", isVerified, isAdmin, updateCategory);
router.delete("/deletecategory/:id", isVerified, isAdmin, deleteCategory);

// router.post("/create", isVerified, isAdmin, createCategory);
// router.get("/", isVerified, getCategories);
// router.get("/:id", isVerified, getCategory);
// router.put("/:id", isVerified, isAdmin, updateCategory);
// router.delete("/:id", isVerified, isAdmin, deleteCategory);

export default router;
