const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  question: String,
  options: [String],
  votes: [Number], // Count for each option
});

module.exports = mongoose.model("Poll", pollSchema);
