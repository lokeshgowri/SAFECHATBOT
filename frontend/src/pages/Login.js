import React, { useState } from "react";
import "./login.css"; 
import { Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        setErrorMsg("Invalid email or password credentials.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      
      const role = data.role?.toLowerCase() || "";
      if (role === "admin") {
        window.location.replace("/admin");
      } else if (role === "faculty") {
        window.location.replace("/faculty");
      } else {
        window.location.replace("/student");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Network error verifying parameters. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      
      {/* Decorative Splash Left Pane (Desktop Only) */}
      <div className="login-left-pane">
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 className="brand-title">SAFECHATBOT</h1>
          <p className="brand-subtitle">
            Welcome to the centralized university AI assistant platform. 
            Access your secure portal to view academic schedules, submit marks, 
            or manage administrative users securely.
          </p>
        </div>
      </div>

      {/* Main Login Form Pane */}
      <div className="login-right-pane">
        <div className="login-glass-box">
          
          <div className="mobile-brand">
            <h2>SAFECHATBOT</h2>
            <p>University AI Assistant</p>
          </div>

          <div className="login-header">
            <h3>Welcome Back</h3>
            <p>Please sign in to your role-based account.</p>
          </div>

          {errorMsg && <div className="error-msg">{errorMsg}</div>}

          <form onSubmit={handleLogin} className="login-form">
            
            <div className="input-container">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail width={18} height={18} style={{ position: 'absolute', left: 14, top: 15, color: '#94a3b8' }}/>
                <input
                  type="email"
                  className="premium-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-container">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock width={18} height={18} style={{ position: 'absolute', left: 14, top: 15, color: '#94a3b8' }}/>
                <input
                  type="password"
                  className="premium-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Authenticating Request..." : "Secure Login"}
            </button>
            
          </form>
        </div>
      </div>

    </div>
  );
};

export default Login;