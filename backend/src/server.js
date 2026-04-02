// 5. Setup the server
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoute.js");

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Mas safe kung specific
    credentials: true, // Importante para sa cookies
  }),
);

app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 3000;

app.use("/api/auth/", authRoutes);

// Calls for server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
