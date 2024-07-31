import Address from "../models/address.model.js";

// const addressSchema = mongoose.Schema({
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     address: { type: String, required: true },
//     city: { type: String, required: true },
//     postalCode: { type: String, required: true },
//     country: { type: String, required: true },
//   },
//   { timestamps: true }
// );

export const createAddress = async (req, res) => {
  const userId = req.userId;

  const { address, city, postalCode, country } = req.body;

  if (!address || !city || !postalCode || !country) {
    return res
      .status(400)
      .json({ status: "fail", message: "All fields are required" });
  }

  const existingAddress = await Address.findOne({ userId });
  if (existingAddress) {
    return res.status(400).json({
      status: "fail",
      message: "Address already exists! please consider updating it !!!",
    });
  }

  try {
    const newAddress = new Address({
      userId,
      address,
      city,
      postalCode,
      country,
    });
    await newAddress.save();
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

export const getAddressWithUserId = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ status: "fail", message: "User not found" });
  }

  try {
    const address = await Address.find({ userId });

    if (!address) {
      return res
        .status(404)
        .json({ status: "fail", message: "Address not found" });
    }

    res.status(200).json({ status: "success", address });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

export const updateAddress = async (req, res) => {
  const { address, city, postalCode, country } = req.body;
  const addressId = req.params.addressId;
  try {
    const Updatedaddress = await Address.findByIdAndUpdate(addressId, {
      address,
      city,
      postalCode,
      country,
    });

    res.status(200).json({ status: "success", Updatedaddress });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

export const updateAddressWithUserId = async (req, res) => {
  const { address, city, postalCode, country } = req.body;
  const userId = req.userId;

  try {
    const updatedAddress = await Address.findOneAndUpdate(
      { userId },
      { address, city, postalCode, country },
      { new: true }
    );

    if (!updatedAddress) {
      return res
        .status(404)
        .json({ status: "fail", message: "Address not found" });
    }

    res.status(200).json({ status: "success", updatedAddress });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

export const deleteAddress = async (req, res) => {
  const addressId = req.params.addressId;
  try {
    await Address.findByIdAndDelete(addressId);
    res
      .status(200)
      .json({ status: "success", message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};
