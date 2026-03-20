import React, { useState, useEffect, useRef } from "react";
import API from "./api";
import "./chat.css";

function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await API.post("/chatbot/message", {
        message: userMessage.text,
      });

      // Handle streaming/chunked text if backend updated, or standard response.
      // API currently sends StreamingResponse text/plain, so we can just use simple text read.
      const botMessage = {
        sender: "bot",
        text: res.data || "The bot didn't respond...",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to AI Server. Please try again." },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div>
           <h3>SAFECHATBOT</h3>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>Student Admin & Faculty AI</p>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Disconnect
        </button>
      </div>

      <div className="chat-main">
        <div className="chat-messages">
          {messages.length === 0 && (
             <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                <h2 style={{ color: 'white' }}>How can I help you today?</h2>
                <p>Ask about library hours, IT support, or academic resources.</p>
             </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.sender === "user" ? "chat-message user" : "chat-message bot"
              }
            >
              {msg.text}
            </div>
          ))}
          {loading && (
             <div className="chat-message bot" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span className="dot" style={{ animation: 'blink 1.4s infinite .2s', width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></span>
                <span className="dot" style={{ animation: 'blink 1.4s infinite .4s', width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></span>
                <span className="dot" style={{ animation: 'blink 1.4s infinite .6s', width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></span>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} disabled={loading}>Send</button>
        </div>
      </div>
{/* Added blinking animation for loading indicators */}
<style>{`
@keyframes blink {
  0% { opacity: .2; }
  20% { opacity: 1; }
  100% { opacity: .2; }
}
`}</style>
    </div>
  );
}

export default ChatPage;