import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminPanel from "./pages/AdminPanel";
import MainLayout from "./components/layout/MainLayout";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Protected Dashboard Routes wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/chat" element={<ChatPage />} />
          
          {/* Fallback & Legacy Redirects */}
          <Route path="/dashboard" element={<Navigate to="/student" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;