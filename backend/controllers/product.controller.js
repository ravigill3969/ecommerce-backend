// const productSchema = mongoose.Schema(
//     {
//       productName: {
//         type: String,
//         required: true,
//       },
//       sellerID: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//       productPrice: {
//         type: Number,
//         required: true,
//       },
//       productDescription: {
//         type: String,
//         required: true,
//       },
//       productCategory: {
//         type: String,
//         required: true,
//       },
//       productCountInStock: {
//         type: Number,
//         required: true,
//       },
//       productRating: {
//         type: Number,
//         default: 0,
//       },
//       reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
//     },
//     { timestamps: true }
//   );

import Product from "../models/product.model.js";
import Review from "../models/review.model.js";

export const createProduct = async (req, res) => {
  const sellerID = req.userId;

  const {
    productName,
    productPrice,
    productDescription,
    productCategory,
    productCountInStock,
  } = req.body;

  try {
    const product = await Product.create({
      productName,
      sellerID,
      productPrice,
      productDescription,
      productCategory,
      productCountInStock,
    });

    res.status(201).json({ status: "success", product });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ status: "success", products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "sellerID",
      "reviews"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ status: "success", message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      productCategory: req.params.category,
    });
    res.status(200).json({ status: "success", products });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ productRating: -1 }).limit(5);
    res.status(200).json({ status: "success", products });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getProductsBySeller = async (req, res) => {
  try {
    const products = await Product.find({ sellerID: req.params.sellerID });
    res.status(200).json({ status: "success", products });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const seeWhatISold = async (req, res) => {
  try {
    const products = await Product.find({ sellerID: req.userId });
    res.status(200).json({ status: "success", products });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const addOrSubstractProductCount = async (req, res) => {
  const { productId, action } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (action === "add") {
      product.productCountInStock += 1;
    } else if (action === "subtract") {
      if (product.productCountInStock > 0) {
        product.productCountInStock -= 1;
      } else {
        return res.status(400).json({ message: "Product out of stock" });
      }
    }
    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

