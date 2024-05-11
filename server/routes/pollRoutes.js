const express = require("express");
const router = express.Router();
const Poll = require("../models/Poll");

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
require("dotenv").config();
// Middleware to verify token
const authenticateToken = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (e) {
      return res.status(403).json({ message: "Forbidden" });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

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
    // res.status(201).json(newPoll);

    const data = {
      user: req.user.userId,
      question: newPoll.question,
      options: newPoll.options,
      votes: newPoll.votes,
    };
    res.status(201).send({
      status: true,
      message: "Poll created successfully",
      data: data,
    });
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

    res.json({ message: "Vote recorded successfully", data: poll });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all Polls API
router.get("/fetchPolls", async (req, res) => {
  try {
    const polls = await Poll.find();
    // res.json(polls);

    res.status(200).send({
      status: true,
      message: "Fetched all polls",
      data: polls,
    });
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
