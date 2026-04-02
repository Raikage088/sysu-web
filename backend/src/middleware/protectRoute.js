// 4. Setup protect route
// To check if the user's token is still valid
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ messege: "Not Authorize, No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ messege: "Not Authorize, Invalid Token" });
    }

    const user = await User.findUserById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("ACTUAL PROTECTION ERROR:", error.message); // I-log natin ang mismong error sa terminal

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(500).json({ message: "Internal server error" });
    }
    // I-log natin ang mismong error sa terminal
    console.log("ACTUAL PROTECTION ERROR:", error.message);

    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { protectRoute };
