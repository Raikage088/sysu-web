// 5. Setup Routes
const express = require("express");
const {
  signup,
  login,
  logout,
  checkAuth,
} = require("../controller/authController.js");
const { protectRoute } = require("../middleware/protectRoute.js");

const router = express.Router();
// Routes on Controller
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
// Routes for checking if user is valid
router.get("/check", protectRoute, checkAuth);

module.exports = router;
