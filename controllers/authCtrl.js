const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authCtrl = {
  register: async (req, res) => {
    const { username, password, first_name, last_name, age, gender } = req.body;
    try {
      if (!username) throw { status: 400, message: "Username is required" };
      if (!password) throw { status: 400, message: "Password is required" };
      if (!first_name) throw { status: 400, message: "First Name is required" };
      if (!last_name) throw { status: 400, message: "Last Name is required" };
      if (!gender) throw { status: 400, message: "Gender is required" };
      if (age <= 0) throw { status: 400, message: "Invalid age" };

      const isDuplicateUsername = await User.findOne({ username });

      if (isDuplicateUsername)
        throw { status: 400, message: "Username has already been used" };

      let hashPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username: username.trim(),
        password: hashPassword,
        first_name,
        last_name,
        age,
        gender,
      });
      let user = await newUser.save();
      user = user.toObject();
      delete user.password;
      res.status(201).json({
        data: user,
        message: "Register successful",
        success: true,
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
  login: async (req, res) => {
    const { username, password } = req.body;
    try {
      if (!username) throw { status: 400, message: "Username is required" };
      if (!password) throw { status: 400, message: "Password is required" };

      let validUser = await User.findOne({ username });
      if (!validUser)
        throw { status: 400, message: "Username or Password is incorrect" };

      let isMatch = await bcrypt.compare(password, validUser.password);

      if (!isMatch)
        throw { status: 400, message: "Username or Password is incorrect" };
      const payload = {
        _id: validUser._id,
        username: validUser.username,
      };
      const access_token = createAccessToken(payload);
      const refresh_token = createRefreshToken(payload);

      res.cookie("refreshToken", refresh_token, {
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1day
      });
      validUser = validUser.toObject();
      delete validUser.password;
      res.status(200).json({
        data: [{ ...validUser, access_token }],
        message: "Login successful",
        success: true,
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
  generateAccessToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) throw { status: 401, message: "Please login" };

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, result) => {
          if (err) throw { status: 401, message: "Please login" };

          const user = await User.findById(result._id).select("-password");

          if (!user) throw { status: 404, message: "User not found" };

          const access_token = createAccessToken({ id: result.id });

          return res.status(201).json({
            data: [{ ...user, access_token }],
            message: "Created access token successful",
            success: true,
          });
        }
      );
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "3d",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = authCtrl;
