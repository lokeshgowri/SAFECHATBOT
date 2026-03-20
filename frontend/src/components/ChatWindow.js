
import React from "react";
import "../components/ChatWindow.css";

function ChatWindow({ messages }) {

  return (

    <div className="chat-window">

      {messages.length === 0 && (
        <div style={{color:"#aaa"}}>Start a conversation...</div>
      )}

      {messages.map((msg, i) => (

        <div
          key={i}
          className={`message ${msg.role === "user" ? "user" : "bot"}`}
        >
          {msg.content}
        </div>

      ))}

    </div>

  );

}

export default ChatWindow;
