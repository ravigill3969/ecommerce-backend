import Review from "../models/review.model.js";
import Product from "../models/product.model.js";

// const reviewSchema = mongoose.Schema(
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
//       userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
//       name: { type: String },
//       rating: { type: Number, required: true },
//       comment: { type: String, required: true },
//     },
//     { timestamps: true }
//   );

export const createReview = async (req, res) => {
  console.log("createReview");
  console.log(req.userId);
  const { productId, rating, comment } = req.body;
  const userId = req.userId;

  try {
    // Validate input
    if (!rating || !comment || !productId) {
      return res
        .status(400)
        .json({ message: "Rating, comment, and product ID are required." });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product." });
    }

    // Create the new review
    const review = new Review({
      productId,
      userId,
      rating,
      comment,
    });

    await review.save();

    // Update the product's reviews array, numReviews, and productRating
    product.reviews.push(review._id); // Add the new review's ID to the product's reviews array
    product.numReviews = product.reviews.length;

    // Calculate the new average rating
    const totalRating =
      product.productRating * (product.numReviews - 1) + rating;
    product.productRating = totalRating / product.numReviews;

    await product.save();

    res.status(201).json({
      status: "success",
      message: "Review added successfully.",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getReviews = async (req, res) => {
  const productId = req.params.productId;
  try {
    const reviews = await Review.find({ productId });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }
    res.status(200).json({
      status: "success",
      message: "Review deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      ({ comment, rating } = req.body),
      {
        new: true,
      }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRandomReview = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId) } }, // Match reviews for the specific product
      { $sample: { size: 1 } }, // Randomly select one review
    ]);

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this product." });
    }

    const review = reviews[0];

    res.status(200).json({
      status: "success",
      review,
    }); 
  } catch (error) {
    console.error("Error fetching random review:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


