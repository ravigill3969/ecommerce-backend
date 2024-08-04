import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    sellerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
    },
    productCountInStock: {
      type: Number,
      required: true,
    },
    productRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
