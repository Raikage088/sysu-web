const User = require("../models/userModel.js");
const { generateToken } = require("../config/utils.js");
// Implement sanitation later
const bcrypt = require("bcrypt");

// Signup controller for creating a new user
const signup = async (req, res) => {
  const {
    phone_number,
    last_name,
    first_name,
    middle_name,
    username,
    password,
  } = req.body;

  try {
    if (
      !phone_number ||
      !last_name ||
      !first_name ||
      // !middle_initial ||
      !username ||
      !password
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    // Sanitation next update
    // Check if Phone number already exists
    const phoneNumberExists = await User.isPhoneNumberTaken(phone_number);
    if (phoneNumberExists) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number already exists" });
    }
    // Check if Password is at least 8 characters long
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }
    // Check if Username already exists
    const usernameExists = await User.isUsernameTaken(username);
    if (usernameExists) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }

    // Hash the password before saving to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    const newUser = await User.createUser({
      phone_number: phone_number,
      last_name: last_name,
      first_name: first_name,
      middle_name: middle_name,
      username: username,
      password: hashedPassword,
    });

    if (newUser) {
      // Generate JWT token and set cookie
      const token = generateToken(newUser, res);

      // Respond with success message and user information and check if middle name exists
      const fullName = `${newUser.first_name} ${newUser.middle_name ? newUser.middle_name + " " : ""}${newUser.last_name}`;

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        token: token,
        data: {
          id: newUser.id,
          full_name: fullName,
        },
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    // Log the error for signup failure and respond with a generic error message
    console.error("DEBUGGER: Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred during signup",
      error_details: error.message,
    });
  }
};

// Login controller for user authentication and token generation
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = generateToken(user, res);

    const fullName = `${user.first_name} ${user.middle_name ? user.middle_name + " " : ""}${user.last_name}`;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      data: {
        user_id: user.id,
        full_name: fullName,
      },
    });
  } catch (error) {
    console.error("DEBUGGER: Login error:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error_details: error.message,
    });
  }
};

// Logout controller for clearing the authentication token
const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
    });
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("DEBUGGER: Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred during logout",
      error_details: error.message,
    });
  }
};

module.exports = { signup, login, logout };
