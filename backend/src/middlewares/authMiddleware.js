const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
};

const protect = async (req, res, next) => {
  let token;

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ success: false, message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Authentication failed: Invalid or expired token",
    });
  }
};

const isCarOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isCarOwner) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Access denied. Car owner privileges required.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Car owner verification failed:", error.message);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Error verifying car owner status",
    });
  }
};

module.exports = { protect, isCarOwner };
