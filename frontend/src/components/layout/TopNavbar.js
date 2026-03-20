import React, { useContext } from "react";
import { AuthContext } from "../../AuthContext";
import { Bell, Search, UserCircle, Menu } from "lucide-react";

const TopNavbar = ({ toggleSidebar }) => {
  const { role } = useContext(AuthContext);

  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Guest";

  return (
    <header className="topbar">
      
      <div className="topbar-left">
        <button onClick={toggleSidebar} className="menu-trigger">
          <Menu className="h-6 w-6" />
        </button>

        <div className="search-box">
          <Search className="search-icon" />
          <input type="text" placeholder="Search resources, topics, or classes..." />
        </div>
      </div>

      <div className="topbar-right">
        <span className="role-badge">{displayRole} Portal</span>

        <button className="icon-btn" onClick={() => alert("You have 0 new notifications.")}>
          <span className="notification-dot"></span>
          <Bell className="h-5 w-5" />
        </button>

        <button className="user-profile" onClick={() => alert("Account settings are currently locked for security verification.")}>
          <UserCircle className="h-8 w-8" style={{ color: '#94a3b8' }} />
          <span>Account</span>
        </button>
      </div>
      
    </header>
  );
};

export default TopNavbar;
