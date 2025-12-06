const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/users  (all users except me)
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
      "_id name phone"
    );
    res.json(users);
  } catch (err) {
    console.error("Users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
