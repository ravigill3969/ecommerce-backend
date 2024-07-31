import express from "express";
import {
  isVerified,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/is-verified", isVerified, (req, res) => {
  res.json({ message: "User is verified" });
});

export default router;
