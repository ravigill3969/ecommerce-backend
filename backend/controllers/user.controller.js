import User from "../models/user.models.js";

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ status: "success", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
