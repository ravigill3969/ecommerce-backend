import express from "express";
import { createReview, deleteReview, getRandomReview, getReviews } from "../controllers/review.controller.js";
import { isVerified } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/create-review", isVerified, createReview);
router.get('/getreviews/:productId', getReviews);
router.get('/get-random-review/:productId', getRandomReview);
router.delete('/delete-review/:reviewId', isVerified, deleteReview);

export default router;
