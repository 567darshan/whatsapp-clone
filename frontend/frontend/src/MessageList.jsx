import React from "react";

const MessageList = React.memo(({ messages, user, activeFriend, formatTime, colors }) => {
  const visibleMessages = messages.filter(
    (m) =>
      (m.fromUserId === user.id && m.toUserId === activeFriend.id) ||
      (m.fromUserId === activeFriend.id && m.toUserId === user.id)
  );

  return (
    <div
      style={{
        flex: 1,
        padding: "16px",
        overflowY: "auto",
        backgroundImage:
          "linear-gradient(to bottom, rgba(11,20,26,0.95), rgba(11,20,26,0.95))",
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
  );
});

export default MessageList;
