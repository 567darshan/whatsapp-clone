const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ===== In-memory data (no DB) =====
const usersByEmail = new Map(); // email -> { id, email, name }
const usersById = new Map();    // id -> { id, email, name }
const otps = new Map();         // email -> { otp, expiresAt }
let nextUserId = 1;

// JWT secret (hard-coded for now, could be from .env)
const JWT_SECRET = "super_secret_for_chat_app";

// ===== Email sending (simplified) =====
// If you don't want real email yet, we will just console.log OTP.
// Later you can configure real SMTP like Gmail.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "yourgmail@gmail.com",     // TODO: replace
    pass: "your_app_password_here",  // TODO: replace
  },
});

// helper: generate 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ===== Express + Socket.IO setup =====
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ===== AUTH ROUTES =====

// 1) Request OTP
app.post("/auth/request-otp", async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ message: "Email and name required" });
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otps.set(email, { otp, expiresAt });

  console.log(`OTP for ${email}: ${otp}`);

  // OPTIONAL: send real email (requires working SMTP)
  try {
    await transporter.sendMail({
      from: '"Chat App" <yourgmail@gmail.com>',
      to: email,
      subject: "Your Chat App OTP",
      text: `Your OTP is: ${otp}`,
    });
  } catch (err) {
    console.log("Email send failed (demo mode):", err.message);
  }

  res.json({ message: "OTP sent (check email or console)" });
});

// 2) Verify OTP & login/register
app.post("/auth/verify-otp", (req, res) => {
  const { email, name, otp } = req.body;
  if (!email || !name || !otp) {
    return res.status(400).json({ message: "Email, name, OTP required" });
  }

  const record = otps.get(email);
  if (!record || record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  if (record.expiresAt < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  // OTP is valid → create user if not exists
  let user = usersByEmail.get(email);
  if (!user) {
    user = { id: String(nextUserId++), email, name };
    usersByEmail.set(email, user);
    usersById.set(user.id, user);
  } else {
    // update name if changed
    user.name = name;
  }

  // clear OTP
  otps.delete(email);

  // create JWT
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token, user });
});

// 3) Get list of other users (for "friends" list)
app.get("/users", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const myId = decoded.id;

    const others = [];
    for (const [id, user] of usersById.entries()) {
      if (id !== myId) {
        others.push({ id: user.id, name: user.name, email: user.email });
      }
    }
    res.json(others);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// simple test
app.get("/", (req, res) => {
  res.send("Chat backend with email login (no DB)");
});

// helper: deterministic room id between two users
const getRoomId = (userId1, userId2) =>
  [userId1, userId2].sort().join("_");

// ===== SOCKET.IO AUTH + CHAT =====

// Verify token that client sends when connecting
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};

io.use(authenticateSocket);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "user:", socket.user);

  // join personal room (for future typing/online status etc.)
  socket.join(`user_${socket.user.id}`);

  // join chat with another user
  socket.on("join_chat", ({ otherUserId }) => {
    const roomId = getRoomId(socket.user.id, otherUserId);
    socket.join(roomId);
    console.log(`User ${socket.user.id} joined room ${roomId}`);
  });

  // send message to other user
  socket.on("send_message", ({ otherUserId, text }) => {
    const roomId = getRoomId(socket.user.id, otherUserId);
    const msg = {
      roomId,
      fromUserId: socket.user.id,
      toUserId: otherUserId,
      text,
      createdAt: new Date().toISOString(),
    };
    io.to(roomId).emit("receive_message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ===== START SERVER =====
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`✅ Chat server running on port ${PORT} (email login, no DB)`);
});
