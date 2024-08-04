// const orderSchema = mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     orderItems: [
//       {
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         quantity: { type: Number, required: true },
//         price: { type: Number, required: true },
//       },
//     ],
//     paymentMethod: {
//       type: String,
//       required: true,
//     },
//     paymentDetails: {
//       id: { type: String },
//       status: { type: String },
//       update_time: { type: String },
//       email_address: { type: String },
//     },
//     taxPrice: { type: Number, required: true, default: 0.0 },
//     shippingPrice: { type: Number, required: true, default: 0.0 },
//     addressId:{type:mongoose.Schema.Types.ObjectId,ref:"Address",required:true},
//     totalPrice: { type: Number, required: true, default: 0.0 },
//     isPaid: { type: Boolean, required: true, default: false },
//     paidAt: { type: Date },
//     orderStatus: {
//       type: String,
//       required: true,
//       enum: ["Pending", "Processing", "Shipped", "Delivered"],
//       default: "Pending",
//     },
//     deliveredAt: { type: Date },
//   },
//   { timestamps: true }
// );
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.models.js";

export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      paymentMethod,
      paymentDetails,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt,
      orderStatus,
      deliveredAt,
    } = req.body;

    const userId = req.userId;

    const user = await User.findById(userId);

    const addressId = user.address;
    if (!addressId) {
      return res
        .status(404)
        .json({ message: "Address not found! Please add an address" });
    }

    const newOrder = new Order({
      userId,
      orderItems,
      paymentMethod,
      paymentDetails,
      taxPrice,
      shippingPrice,
      totalPrice,
      addressId,
      isPaid,
      paidAt,
      orderStatus,
      deliveredAt,
    });

    const createdOrder = await newOrder.save();

    // Notify Sellers (console log for now)
    const productIds = orderItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).populate(
      "sellerID"
    );

    products.forEach((product) => {
      const seller = product.sellerID;
      if (seller) {
        console.log(
          `Notification to seller ${seller.email}: You have received a new order with Order ID: ${createdOrder._id} for the product: ${product.productName}. Please pack and ship the item as soon as possible.`
        );
      }
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ message: "Failed to create order", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId")
      .populate("orderItems.product")
      .populate("addressId"); // Populate address details

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch order", error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ status: "fail", message: "User not found" });
    }

    const orders = await Order.find({ userId: req.userId });

    if (!orders) {
      res.status(404).json({ status: "fail", message: "No order found" });
    }

    res.status(200).json({ status: "success", orders });
  } catch (error) {
    console.log("getMyOrders error", error);
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const {
      orderItems,
      paymentMethod,
      paymentDetails,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt,
      orderStatus,
      deliveredAt,
    } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderItems = orderItems || order.orderItems;
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.paymentDetails = paymentDetails || order.paymentDetails;
    order.taxPrice = taxPrice ?? order.taxPrice;
    order.shippingPrice = shippingPrice ?? order.shippingPrice;
    order.totalPrice = totalPrice ?? order.totalPrice;
    order.isPaid = isPaid ?? order.isPaid;
    order.paidAt = paidAt || order.paidAt;
    order.orderStatus = orderStatus || order.orderStatus;
    order.deliveredAt = deliveredAt || order.deliveredAt;

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res
      .status(500)
      .json({ message: "Failed to update order", error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.remove();

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.userId; // Assuming req.userId is the ID of the logged-in seller

    // Find products that belong to the seller
    const sellerProducts = await Product.find({ sellerID: sellerId });

    // Extract the product IDs
    const sellerProductIds = sellerProducts.map((product) => product._id);

    // Find orders that contain the seller's products
    const orders = await Order.find({
      "orderItems.product": { $in: sellerProductIds },
    })
      .populate("userId", "name email") // Populate buyer info
      .populate("orderItems.product", "productName productPrice"); // Populate product details

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

