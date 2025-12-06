import MessageList from "./MessageList";
import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE = "http://localhost:5000";
let socket = null;

// WhatsApp-ish colors
const colors = {
  appBg: "#0b141a",
  sidebarBg: "#111b21",
  sidebarText: "#e9edef",
  sidebarItemHover: "#202c33",
  chatBg: "#0b141a",
  chatPanel: "#202c33",
  bubbleMe: "#005c4b",
  bubbleThem: "#202c33",
  bubbleText: "#e9edef",
  timeText: "#8696a0",
  border: "#202c33",
};

const formatTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

function App() {
  const [stage, setStage] = useState("login"); // login | otp | friends | chat
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [users, setUsers] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]); // all messages
  const [text, setText] = useState("");

  // ===== auto-login if stored =====
  useEffect(() => {
    const savedUser = localStorage.getItem("chatUser");
    const savedToken = localStorage.getItem("chatToken");
    if (savedUser && savedToken) {
      const u = JSON.parse(savedUser);
      setUser(u);
      setToken(savedToken);
      setStage("friends");
      initSocket(savedToken);
      fetchUsers(savedToken);
    }
  }, []);

  const initSocket = (jwtToken) => {
    if (socket) socket.disconnect();

    socket = io(API_BASE, {
      auth: { token: jwtToken },
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  };

  const requestOtp = async () => {
    try {
      await axios.post(`${API_BASE}/auth/request-otp`, { email, name });
      alert("OTP sent (check email or backend console)");
      setStage("otp");
    } catch (err) {
      alert(err.response?.data?.message || "Error requesting OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post(`${API_BASE}/auth/verify-otp`, {
        email,
        name,
        otp,
      });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem("chatUser", JSON.stringify(res.data.user));
      localStorage.setItem("chatToken", res.data.token);
      setStage("friends");
      initSocket(res.data.token);
      fetchUsers(res.data.token);
    } catch (err) {
      alert(err.response?.data?.message || "Error verifying OTP");
    }
  };

  const fetchUsers = async (jwtToken) => {
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Users fetch error", err);
    }
  };

  const openChat = (friend) => {
    setActiveFriend(friend);
    setStage("chat");

    if (socket) {
      socket.emit("join_chat", { otherUserId: friend.id });
    }
  };

  const sendMessage = () => {
    if (!text.trim() || !activeFriend || !socket || !user) return;

    socket.emit("send_message", {
      otherUserId: activeFriend.id,
      text,
    });

    setText("");
  };

  const logout = () => {
    localStorage.removeItem("chatUser");
    localStorage.removeItem("chatToken");
    if (socket) socket.disconnect();
    socket = null;
    setUser(null);
    setToken("");
    setUsers([]);
    setActiveFriend(null);
    setMessages([]);
    setStage("login");
  };

  // ========== SIMPLE SCREENS FOR LOGIN / OTP ==========

  if (stage === "login") {
    return (
      <div
        style={{
          height: "100vh",
          background: colors.appBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.sidebarText,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            background: colors.chatPanel,
            padding: 24,
            borderRadius: 12,
            width: 360,
            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 16 }}>WhatsApp Clone – Login</h2>
          <label style={{ fontSize: 13 }}>Name</label>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 12,
              marginTop: 4,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #313d45",
              background: "#202c33",
              color: colors.sidebarText,
            }}
          />
          <label style={{ fontSize: 13 }}>Email</label>
          <input
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 16,
              marginTop: 4,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #313d45",
              background: "#202c33",
              color: colors.sidebarText,
            }}
          />
          <button
            onClick={requestOtp}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "none",
              background: "#00a884",
              color: "#111b21",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Send OTP
          </button>
        </div>
      </div>
    );
  }

  if (stage === "otp") {
    return (
      <div
        style={{
          height: "100vh",
          background: colors.appBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.sidebarText,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            background: colors.chatPanel,
            padding: 24,
            borderRadius: 12,
            width: 360,
            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 16 }}>Enter OTP</h2>
          <p style={{ fontSize: 13, marginTop: 0, marginBottom: 12 }}>
            We sent an OTP to <strong>{email}</strong>
          </p>
          <input
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 16,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #313d45",
              background: "#202c33",
              color: colors.sidebarText,
            }}
          />
          <button
            onClick={verifyOtp}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "none",
              background: "#00a884",
              color: "#111b21",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Verify & Login
          </button>
        </div>
      </div>
    );
  }

  // ========== MAIN LAYOUT (FRIENDS + CHAT) ==========

  const LayoutWrapper = ({ children }) => (
    <div
      style={{
        height: "100vh",
        background: colors.appBg,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 1200,
          height: "100%",
          background: "#0a1014",
          boxShadow: "0 0 20px rgba(0,0,0,0.4)",
        }}
      >
        {children}
      </div>
    </div>
  );

  const Sidebar = ({ showBackToUsers }) => (
    <aside
      style={{
        width: 280,
        background: colors.sidebarBg,
        color: colors.sidebarText,
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${colors.border}`,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "10px 12px",
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ fontWeight: 600 }}>{user?.name}</div>
        <div style={{ fontSize: 12, color: colors.timeText }}>{user?.email}</div>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: "8px 12px",
          display: "flex",
          gap: 8,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <button
          onClick={logout}
          style={{
            flex: 1,
            padding: "6px 8px",
            borderRadius: 999,
            border: "none",
            background: "#202c33",
            color: colors.sidebarText,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
        {showBackToUsers && (
          <button
            onClick={() => setStage("friends")}
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: 999,
              border: "none",
              background: "#202c33",
              color: colors.sidebarText,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Back
          </button>
        )}
      </div>

      {/* Users list */}
      <div style={{ padding: "8px 12px", fontSize: 13, opacity: 0.9 }}>Users</div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {users.length === 0 && (
          <div style={{ fontSize: 13, padding: "0 12px", color: colors.timeText }}>
            No other users yet.
          </div>
        )}
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => openChat(u)}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              background:
                activeFriend && activeFriend.id === u.id ? colors.sidebarItemHover : "none",
            }}
          >
            <div style={{ fontSize: 15 }}>{u.name}</div>
            <div style={{ fontSize: 12, color: colors.timeText }}>{u.email}</div>
          </div>
        ))}
      </div>
    </aside>
  );

  // FRIENDS SCREEN (no chat selected)
  if (stage === "friends") {
    return (
      <LayoutWrapper>
        <Sidebar showBackToUsers={false} />
        <main
          style={{
            flex: 1,
            background: colors.chatBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.timeText,
          }}
        >
          <p>Select a user on the left to start chatting.</p>
        </main>
      </LayoutWrapper>
    );
  }

  // CHAT SCREEN
  if (stage === "chat" && activeFriend && user) {
    const visibleMessages = messages.filter(
      (m) =>
        (m.fromUserId === user.id && m.toUserId === activeFriend.id) ||
        (m.fromUserId === activeFriend.id && m.toUserId === user.id)
    );

    return (
      <LayoutWrapper>
        <Sidebar showBackToUsers={true} />

        <main
          style={{
            flex: 1,
            background: colors.chatBg,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Chat header */}
          <header
            style={{
              height: 60,
              background: colors.chatPanel,
              borderLeft: `1px solid ${colors.border}`,
              borderBottom: `1px solid ${colors.border}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 16px",
            }}
          >
            <div style={{ color: colors.sidebarText, fontWeight: 500 }}>
              {activeFriend.name}
            </div>
            <div style={{ color: colors.timeText, fontSize: 12 }}>
              {activeFriend.email}
            </div>
          </header>

          {/* Messages area */}
          <div
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              backgroundImage:
                "linear-gradient(to bottom, rgba(11,20,26,0.95), rgba(11,20,26,0.95)), url('https://i.imgur.com/8Km9tLL.png')",
              backgroundSize: "cover",
            }}
          >
            {visibleMessages.map((m, idx) => {
              const isMe = m.fromUserId === user.id;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "65%",
                      background: isMe ? colors.bubbleMe : colors.bubbleThem,
                      color: colors.bubbleText,
                      padding: "6px 8px 4px",
                      borderRadius: 10,
                      borderBottomRightRadius: isMe ? 0 : 10,
                      borderBottomLeftRadius: isMe ? 10 : 0,
                      fontSize: 14,
                    }}
                  >
                    <div>{m.text}</div>
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: 11,
                        marginTop: 2,
                        color: colors.timeText,
                      }}
                    >
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input bar */}
          <div
            style={{
              height: 60,
              background: colors.chatPanel,
              borderLeft: `1px solid ${colors.border}`,
              borderTop: `1px solid ${colors.border}`,
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              gap: 8,
            }}
          >
            <input
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 20,
                border: "none",
                outline: "none",
                background: "#202c33",
                color: colors.sidebarText,
                fontSize: 14,
              }}
              placeholder="Type a message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "none",
                background: "#00a884",
                color: "#111b21",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </main>
      </LayoutWrapper>
    );
  }

  return null;
}

export default App;
