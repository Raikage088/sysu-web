const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

// Gamitin ang pool para sa better performance at promise support
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Ito ang kailangan ng models mo
module.exports = pool.promise();
