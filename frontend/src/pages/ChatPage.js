import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  MessageSquare, 
  Plus, 
  Bot, 
  User, 
  Loader2,
  File,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import '../chat.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadState, setUploadState] = useState({ file: null, status: 'idle', message: '' }); 
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setUploadState({ file, status: 'error', message: 'Unsupported format. Use PDF, DOCX, JPG, PNG.' });
      return;
    }

    setUploadState({ file, status: 'uploading', message: 'Uploading...' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        setUploadState({ file, status: 'success', message: 'Document indexed successfully!' });
        setTimeout(() => setUploadState({ file: null, status: 'idle', message: '' }), 5000);
      } else {
        const err = await response.json();
        setUploadState({ file, status: 'error', message: err.detail || 'Upload failed.' });
      }
    } catch (err) {
      setUploadState({ file, status: 'error', message: 'Network error during upload.' });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: userMsg.text })
      });

      if (!response.ok) throw new Error('Failed to connect');

      setMessages(prev => [...prev, { sender: 'bot', text: '' }]);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = { ...newMessages[newMessages.length - 1] };
          lastMsg.text += chunk;
          newMessages[newMessages.length - 1] = lastMsg;
          return newMessages;
        });
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const history = [
    { title: "Library hours schedule", date: "Today" },
    { title: "Semester marks inquiry", date: "Yesterday" },
  ];

  return (
    <div className="chat-layout">
      
      <div className="chat-sidebar">
        <button className="new-chat-btn">
          <Plus width={20} height={20} /> New Chat
        </button>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div className="chat-history-label">Recent Chats</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {history.map((h, i) => (
              <button key={i} className="history-item">
                <MessageSquare width={16} height={16} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-messages">
          
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Bot width={32} height={32} />
              </div>
              <h2 className="empty-title">Campus Assistant AI</h2>
              <p className="empty-subtitle">
                I can help you find class schedules, retrieve marks, summarize notes, or direct you to campus resources.
              </p>
              <div className="prompt-grid">
                {['What is my attendance?', 'Upload my notes snippet', 'Where is the library?'].map(q => (
                  <button 
                    key={q}
                    onClick={() => setInput(q)} 
                    className="prompt-btn"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-container">
              {messages.map((msg, i) => (
                <div key={i} className={`message-row ${msg.sender}`}>
                  <div className={`avatar ${msg.sender}`}>
                    {msg.sender === 'user' ? <User width={20} height={20} /> : <Bot width={20} height={20} />}
                  </div>
                  <div className={`message-bubble ${msg.sender}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message-row bot">
                  <div className="avatar bot">
                    <Bot width={20} height={20} />
                  </div>
                  <div className="typing-indicator">
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <div className="input-container">
            
            {uploadState.status !== 'idle' && (
              <div className={`upload-banner ${uploadState.status}`}>
                <div className="banner-content">
                  {uploadState.status === 'uploading' && <Loader2 width={16} height={16} className="lucide-spin" />}
                  {uploadState.status === 'success' && <CheckCircle width={16} height={16} />}
                  {uploadState.status === 'error' && <AlertCircle width={16} height={16} />}
                  <File width={16} height={16} style={{ opacity: 0.7, marginLeft: '4px' }} />
                  <span style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{uploadState.file?.name}</span>
                  <span style={{ opacity: 0.8, margin: '0 4px' }}>&middot;</span>
                  <span>{uploadState.message}</span>
                </div>
                {uploadState.status !== 'uploading' && (
                  <button className="close-banner-btn" onClick={() => setUploadState({ file: null, status: 'idle', message: '' })}>
                    <X width={16} height={16} />
                  </button>
                )}
              </div>
            )}

            <form onSubmit={sendMessage} className="chat-form">
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
                id="file-upload" 
                accept=".txt,.pdf,.docx,.jpg,.jpeg,.png" 
              />
              <label htmlFor="file-upload" className="attach-btn" title="Attach Document">
                <Paperclip width={20} height={20} />
              </label>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Campus Assistant..."
                className="chat-input"
                disabled={loading}
              />

              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className={`send-btn ${input.trim() && !loading ? 'active' : ''}`}
              >
                {loading ? <Loader2 width={20} height={20} className="lucide-spin" /> : <Send width={20} height={20} />}
              </button>
            </form>
            <div className="disclaimer">
              SAFECHATBOT can make mistakes. Verify important academic info.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
