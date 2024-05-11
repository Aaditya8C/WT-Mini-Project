const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Poll = require("../models/Poll");

// Middleware to verify token
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (token == null) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, "secretkey", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
}

// Create Poll API
router.post("/polls", authenticateToken, async (req, res) => {
  const poll = new Poll({
    user: req.user.userId,
    question: req.body.question,
    options: req.body.options,
    votes: Array(req.body.options.length).fill(0), // Initialize votes count to zero
  });
  try {
    const newPoll = await poll.save();
    res.status(201).json(newPoll);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Vote for Poll API
router.put("/polls/:id/vote", authenticateToken, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    const optionIndex = req.body.optionIndex;
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option index" });
    }
    poll.votes[optionIndex]++;
    await poll.save();
    res.json({ message: "Vote recorded successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all Polls API
router.get("/polls", async (req, res) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Polls for Specific User API
router.get("/user/polls", authenticateToken, async (req, res) => {
  try {
    const polls = await Poll.find({ user: req.user.userId });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
