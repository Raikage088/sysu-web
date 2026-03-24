// For Generating token via ID and secret key
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

// Generate JWT token with user ID and secret key, set expiration to 7 day
const generateToken = (user, res) => {
  const token = jwt.sign({ id: user.admin_id }, secretKey, { expiresIn: "7d" });

  const isProduction = process.env.NODE_ENV !== "production";

  res.cookie("token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // Set cookie expiration to 7 days
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    secure: isProduction, // Use secure cookies in production (HTTPS)
    sameSite: "Strict", // Prevent CSRF attacks by only sending cookies in same-site requests
  });
  return token;
};

module.exports = { generateToken };
