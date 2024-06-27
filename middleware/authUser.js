const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authUser = async (req, res, next) => {
  try {
    const token = req?.headers["authorization"]?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ message: "Unauthorized", error: true });

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "Unauthorized", error: true });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded)
      return res.status(403).json({ message: "Forbidden", error: true });

    const user = await User.findOne({ _id: decoded._id });

    if (!user)
      return res.status(401).json({ message: "Please Login", error: true });
    req.user = user.toObject();
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message, error: true });
  }
};

module.exports = authUser;
