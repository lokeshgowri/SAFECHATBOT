import React from "react";

function MessageBubble({ message }) {

  const isUser = message.role === "user";

  return (
    <div className={isUser ? "message user" : "message bot"}>

      <div className="bubble">
        {message.content}
      </div>

    </div>
  );
}

export default MessageBubble;