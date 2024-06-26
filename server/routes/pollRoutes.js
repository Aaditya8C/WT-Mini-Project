const express = require("express");
const router = express.Router();
const Poll = require("../models/Poll");

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const authenticateToken = require("../authenticateToken");
require("dotenv").config();
// Middleware to verify token

// Create Poll API
router.post("/polls", authenticateToken, async (req, res) => {
  console.log(req.user._id);
  const poll = new Poll({
    user: req.user._id,
    question: req.body.question,
    options: req.body.options,
    votes: Array(req.body.options.length).fill(0), // Initialize votes count to zero
    category: req.body.category,
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
router.put("/polls/:id/vote", async (req, res) => {
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
    const polls = await Poll.find().populate("user").sort({ createdAt: -1 });
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
    const polls = await Poll.find({ user: req.user._id }).populate("user");
    res.status(200).send({
      status: true,
      message: "Fetched users polls",
      data: polls,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all Polls API by category
router.get("/fetchPolls/:category", async (req, res) => {
  try {
    const category = req.params.category; // Get the category from the URL parameters
    let polls;

    if (category) {
      polls = await Poll.find({ category })
        .populate("user")
        .sort({ createdAt: -1 });
    } else {
      polls = await Poll.find().populate("user").sort({ createdAt: -1 });
    }

    res.status(200).send({
      status: true,
      message: "Fetched all polls",
      data: polls,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
