import React, { useContext, useState } from "react";
import { AuthContext } from "../../AuthContext";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  LogOut,
  GraduationCap,
  X
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { role, logout } = useContext(AuthContext);
  const location = useLocation();

  const [showSettings, setShowSettings] = useState(false);
  const [passData, setPassData] = useState({ current_password: '', new_password: '', confirm_password: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
      alert("New password and confirm password do not match!");
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(passData)
      });
      if (res.ok) {
        alert("Password updated successfully!");
        setShowSettings(false);
        setPassData({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    }
  };

  const getNavItems = () => {
    const defaultItems = [
      { name: "Chatbot AI", path: "/chat", icon: <MessageSquare className="w-5 h-5" /> },
    ];

    if (role === "student") {
      return [
        { name: "Dashboard", path: "/student", icon: <LayoutDashboard className="w-5 h-5" /> },
        ...defaultItems
      ];
    } else if (role === "faculty") {
      return [
        { name: "Dashboard", path: "/faculty", icon: <LayoutDashboard className="w-5 h-5" /> },
        ...defaultItems
      ];
    } else if (role === "admin") {
      return [
        { name: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
        ...defaultItems
      ];
    }

    return defaultItems;
  };

  const navItems = getNavItems();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap className="w-5 h-5" style={{ color: 'white' }} />
          </div>
          <span>SafeChat</span>
        </div>
        <button className="menu-trigger" onClick={toggleSidebar}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="sidebar-nav">
        <div className="nav-label">Menu</div>
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/student" && item.path !== "/faculty" && item.path !== "/admin");
          const exactMatch = (item.path === "/student" || item.path === "/faculty" || item.path === "/admin") 
                              ? location.pathname === item.path : isActive;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-item ${exactMatch ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <button className="action-btn" onClick={() => setShowSettings(true)}>
          <Settings className="w-5 h-5" />
          Settings
        </button>
        <button 
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
          className="action-btn danger"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
      
      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '400px', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Account Settings</h2>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X width={20}/></button>
            </div>
            
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>Current Password</label>
                <input 
                  required 
                  type="password" 
                  value={passData.current_password} 
                  onChange={e => setPassData({...passData, current_password: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>New Password</label>
                <input 
                  required 
                  type="password" 
                  value={passData.new_password} 
                  onChange={e => setPassData({...passData, new_password: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>Confirm New Password</label>
                <input 
                  required 
                  type="password" 
                  value={passData.confirm_password} 
                  onChange={e => setPassData({...passData, confirm_password: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" style={{ padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

    </aside>
  );
};

export default Sidebar;
