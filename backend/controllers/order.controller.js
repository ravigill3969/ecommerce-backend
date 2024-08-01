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
import User from "../models/user.models.js";

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      orderItems,
      paymentMethod,
      paymentDetails,
      taxPrice,
      shippingPrice,
      totalPrice,
      addressId, // Either existing address ID
      address, // Or address details to create a new address
      isPaid,
      paidAt,
      orderStatus,
      deliveredAt,
    } = req.body;

    let finalAddressId = addressId;

    // If address details are provided instead of addressId, create a new Address
    if (!addressId && address) {
      const newAddress = new Address({
        user: userId,
        ...address,
      });
      const savedAddress = await newAddress.save();
      finalAddressId = savedAddress._id;
    }

    const newOrder = new Order({
      userId,
      orderItems,
      paymentMethod,
      paymentDetails,
      taxPrice,
      shippingPrice,
      totalPrice,
      addressId: finalAddressId,
      isPaid,
      paidAt,
      orderStatus,
      deliveredAt,
    });

    const createdOrder = await newOrder.save();
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

    const orders = await Order.find({ user: user._id });

    if (!orders) {
      res.status(404).json({ status: "fail", message: "No order found" });
    }

    res.status(200).json({ status: "success", orders });
  } catch (error) {
    console.log("getMyOrders error", error);
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

export const updateOrderToPaid = async (req, res) => {
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
