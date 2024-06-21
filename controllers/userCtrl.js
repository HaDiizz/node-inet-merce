const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const userCtrl = {
  getAllUsers: async (req, res) => {
    try {
      if (req.user.role !== "admin")
        throw { status: 403, message: "Permission denied" };
      const users = await User.find().select("-password");
      res.status(200).json({
        data: users,
        message: "Get users successful",
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
  getUser: async (req, res) => {
    const { id } = req.params;
    try {
      let user = await User.findById(id);

      if (!user) throw { status: 404, message: "User not found" };
      user = user.toObject();
      delete user.password;
      res.status(200).json({
        data: user,
        message: "Get user successful",
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
  getMe: async (req, res) => {
    try {
      if (!req?.user) throw { status: 401, message: "Unauthorized" };
      let user = await User.findById(req.user._id);
      if (!user) throw { status: 404, message: "User not found" };
      user = user.toObject();
      delete user.password;
      res.status(200).json({
        data: user,
        message: "Get profile successful",
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
  updateUser: async (req, res) => {
    const { username, password, first_name, last_name, age, gender } = req.body;
    const { id } = req.params;
    try {
      if (req.user.role === "user" && req.user._id.toString() !== id.toString())
        throw { status: 403, message: "Permission denied" };
      const isValidUser = User.findById(id);
      if (!isValidUser) throw { status: 404, message: "User not found" };
      if (username === "")
        throw { status: 400, message: "Username is required" };
      if (first_name === "")
        throw { status: 400, message: "First Name is required" };
      if (last_name === "")
        throw { status: 400, message: "Last Name is required" };
      if (gender === "") throw { status: 400, message: "Gender is required" };
      if (Number(age) < 0) throw { status: 400, message: "Age is required" };

      let hashPassword;
      if (password) {
        hashPassword = await bcrypt.hash(password, 10);
      }

      await User.updateOne(
        { _id: id },
        {
          $set: {
            ...req.body,
            password: password ? hashPassword : isValidUser.password,
            user_id: isValidUser.user_id,
            role: isValidUser.role,
            _id: isValidUser._id,
          },
        },
        { new: true }
      );
      let user = await User.findById(id);
      if (!user) throw { status: 404, message: "User not found" };
      user = user.toObject();
      delete user.password;
      res.status(201).json({
        data: user,
        message: "Updated successful",
        success: true,
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      if (!id) throw { status: 400, message: "User ID is required" };

      const user = await User.findOneAndDelete({ _id: id });

      if (!user) throw { status: 404, message: "User not found" };

      res.status(200).json({
        data: user,
        message: "Deleted successful",
        success: true,
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
};

module.exports = userCtrl;
