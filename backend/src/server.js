const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db.js');

dotenv.config();
const app = express();

const port = process.env.PORT || 3000;

// Calls for server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})