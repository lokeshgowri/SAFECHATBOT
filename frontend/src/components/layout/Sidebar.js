import React, { useContext } from "react";
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
        <button className="action-btn" onClick={() => alert("Settings configuration coming soon!")}>
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
      
    </aside>
  );
};

export default Sidebar;
