const express = require("express");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");

const port = process.env.PORT || 8080;

const router = require("./src");

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS and logging
app.use(cors());

app.use(router); // Attach restaurant routes

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
