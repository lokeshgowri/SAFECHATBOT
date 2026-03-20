import React, { useEffect, useState, useCallback } from "react";

function Sidebar() {

  const [conversations, setConversations] = useState([]);

  const getToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.clear();
      window.location.replace("/");
      return null;
    }

    return token;
  };

  const fetchConversations = useCallback(async () => {

    const token = getToken();
    if (!token) return;

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/chatbot/conversations",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        localStorage.clear();
        window.location.replace("/");
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setConversations(data);
      } else {
        setConversations([]);
      }

    } catch (error) {
      console.error("Fetch error:", error);
    }

  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (

    <div className="sidebar">

      <h3>Conversations</h3>

      {conversations.length === 0 && (
        <p>No conversations</p>
      )}

      {conversations.map((conv) => (
        <div key={conv.ConversationId}>
          {conv.Title || "Chat"}
        </div>
      ))}

    </div>

  );

}

export default Sidebar;