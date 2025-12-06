const express = require("express");
const Message = require("../models/message");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/messages/:otherUserId
router.get("/:otherUserId", auth, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
