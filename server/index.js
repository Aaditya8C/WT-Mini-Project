const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const pollRoutes = require("./routes/pollRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGOURI = process.env.MONGOURI;

// Connect to MongoDB
mongoose.connect(MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api", userRoutes);
app.use("/api", pollRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
