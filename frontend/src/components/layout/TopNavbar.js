import React, { useContext, useState } from "react";
import { AuthContext } from "../../AuthContext";
import { Bell, Search, UserCircle, Menu } from "lucide-react";

const TopNavbar = ({ toggleSidebar }) => {
  const { role } = useContext(AuthContext);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [showAccount, setShowAccount] = useState(false);
  const [accountData, setAccountData] = useState(null);

  const fetchAccountData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/me", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) setAccountData(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleToggleAccount = () => {
    if (!showAccount && !accountData) {
      fetchAccountData();
    }
    setShowAccount(!showAccount);
    setShowNotifications(false); // Close other dropdown
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/announcements", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (err) { console.error(err); }
  };

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
    setShowAccount(false); // Close other dropdown
  };

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

        <div style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={handleToggleNotifications}>
            {notifications.length > 0 && <span className="notification-dot"></span>}
            <Bell className="h-5 w-5" />
          </button>
          
          {showNotifications && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '320px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 50 }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Recent Announcements</h3>
              </div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>No recent notifications.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.Id} style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: '#0f172a' }}>{n.Title}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>{n.Content}</p>
                      <small style={{ display: 'block', marginTop: '8px', color: '#94a3b8', fontSize: '0.7rem' }}>{n.DatePosted}</small>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button className="user-profile" onClick={handleToggleAccount}>
            <UserCircle className="h-8 w-8" style={{ color: '#94a3b8' }} />
            <span>Account</span>
          </button>
          
          {showAccount && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '280px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 50 }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>My Profile</h3>
              </div>
              <div style={{ padding: '16px' }}>
                {!accountData ? (
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Loading Profile...</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Name</span>
                      <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: '500' }}>{accountData.FullName}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Email</span>
                      <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{accountData.Email}</div>
                    </div>
                    {accountData.Role === 'student' && (
                       <>
                         <div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Major</span>
                            <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{accountData.Major || 'N/A'}</div>
                         </div>
                         <div style={{ display: 'flex', gap: '24px' }}>
                            <div>
                               <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Year</span>
                               <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{accountData.EnrollmentYear || 'N/A'}</div>
                            </div>
                            <div>
                               <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Semester</span>
                               <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{accountData.CurrentSemester || 'N/A'}</div>
                            </div>
                         </div>
                       </>
                    )}
                    {accountData.Role === 'faculty' && (
                       <>
                         <div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Department</span>
                            <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{accountData.Department || 'N/A'}</div>
                         </div>
                         <div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Designation</span>
                            <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{accountData.Designation || 'N/A'}</div>
                         </div>
                       </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
      </div>
      
    </header>
  );
};

export default TopNavbar;
