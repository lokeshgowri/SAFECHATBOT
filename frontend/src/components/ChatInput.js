
import React, { useState, useRef } from "react";

function ChatInput({ onSend }) {

  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleSend = () => {

    console.log("SEND BUTTON CLICKED");

    const message = text.trim();
    if (!message) return;

    console.log("Sending message:", message);

    if (typeof onSend === "function") {
      onSend(message);
    } else {
      console.error("onSend function not received by ChatInput");
    }

    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !uploading) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append("file", file);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/upload/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUploadMessage("Upload successful!");
        setTimeout(() => setUploadMessage(""), 4000);
      } else {
        setUploadMessage(data.detail || "Upload failed");
      }

    } catch (error) {

      console.error("Upload error:", error);
      setUploadMessage("Upload failed.");

    } finally {

      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    }

  };

  return (

    <div
      className="chat-input-wrapper"
      style={{
        width: "100%",
        background: "#202123",
        borderTop: "1px solid #444",
        padding: "10px 20px"
      }}
    >

      {uploadMessage && (
        <div
          style={{
            fontSize: "0.85rem",
            color: "#7c3aed",
            marginBottom: "6px"
          }}
        >
          {uploadMessage}
        </div>
      )}

      <div
        className="chat-input"
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center"
        }}
      >

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept=".pdf,.txt,.docx"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Attach File"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "1px solid #555",
            background: "#343541",
            color: "white",
            cursor: "pointer"
          }}
        >
          📎
        </button>

        <input
          type="text"
          placeholder="Ask something..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={uploading}
          style={{
            flex: 1,
            height: "40px",
            borderRadius: "6px",
            border: "1px solid #555",
            padding: "0 10px",
            background: "#40414f",
            color: "white"
          }}
        />

        <button
          onClick={handleSend}
          disabled={uploading || !text.trim()}
          style={{
            height: "40px",
            padding: "0 16px",
            borderRadius: "6px",
            border: "none",
            background: "#7c3aed",
            color: "white",
            cursor: "pointer"
          }}
        >
          Send
        </button>

      </div>

    </div>

  );

}

export default ChatInput;