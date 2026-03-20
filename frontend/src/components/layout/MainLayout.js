import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import "../../dashboard.css"; // Generic layout CSS

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout-container">
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Wrapper */}
      <div className="layout-main">
        
        {/* Top Navigation */}
        <TopNavbar toggleSidebar={toggleSidebar} />

        {/* Dynamic Page Content rendered by React Router Outlet */}
        <main className="page-container">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default MainLayout;
