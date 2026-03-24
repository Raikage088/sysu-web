const db = require("../config/db.js").promise();

const User = {
  // Insert new user into database and return user with data with new ID
  createUser: async (user) => {
    try {
      const sql = `INSERT INTO admin (phone_number, last_name, first_name, middle_initial, username, password, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, 1)`;

      const [result] = await db.execute(sql, [
        user.phone_number,
        user.last_name,
        user.first_name,
        user.middle_initial || null, // Optional Middle Initial, set to null if not provided
        user.username,
        user.password, // Hashed on controller before saving
      ]);
      return { admin_id: result.insertId, ...user }; // Return the newly created driver's ID and inserted a unique ID via auto-increment in the database
    } catch (error) {
      throw new Error("Failed to create user: " + error);
    }
  },
  //
  getUserByUsername: async (username) => {
    try {
      // Select user by username and is_active = 1, return only one user if found
      const sql = `SELECT admin_id, username, password, first_name, middle_initial, last_name
                         FROM admin
                         WHERE username = ?
                           AND is_active = 1
                         LIMIT 1`;
      const [rows] = await db.execute(sql, [username]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Failed to retrieve user: " + error);
    }
  },
  findUserById: async (admin_id) => {
    try {
      const sql = `SELECT admin_id, phone_number, last_name, first_name, middle_initial, username FROM admin WHERE admin_id = ? AND is_active = 1 LIMIT 1`;

      const [rows] = await db.execute(sql, [admin_id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Failed to find user by ID: " + error);
    }
  },
  isUsernameTaken: async (username) => {
    try {
      const sql = `SELECT COUNT(*) AS count FROM admin WHERE username = ? AND is_active = 1`;
      const [rows] = await db.execute(sql, [username]);
      return rows[0].count > 0; // Return true if there's count, otherwise false
    } catch (error) {
      throw new Error("Failed to check username: " + error);
    }
  },
  isPhoneNumberTaken: async (phone_number) => {
    try {
      const sql = `SELECT COUNT(*) AS count FROM admin WHERE phone_number = ? AND is_active = 1`;
      const [rows] = await db.execute(sql, [phone_number]);
      return rows[0].count > 0; // Return true if there's count, otherwise false
    } catch (error) {
      throw new Error("Failed to check phone number: " + error);
    }
  },
};

module.exports = User;
