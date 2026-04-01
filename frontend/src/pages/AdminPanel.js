import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Database, UserPlus, Trash2, Edit, X, Bell, FileText, DownloadCloud, Landmark, CalendarDays, DollarSign, LayoutDashboard, CreditCard
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [usersList, setUsersList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [details, setDetails] = useState([]);
  const [results, setResults] = useState([]);
  const [fees, setFees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [payments, setPayments] = useState([]);
  const [salaries, setSalaries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ FullName: '', Email: '', Role: 'student' });
  const [annData, setAnnData] = useState({ Title: '', Content: '', DatePosted: new Date().toLocaleDateString() });
  const [detailData, setDetailData] = useState({ DetailType: '', Description: '' });
  const [resultData, setResultData] = useState({ Semester: '', LinkFormat: '' });
  const [feeData, setFeeData] = useState({ Program: '', Amount: 0, Deadline: '' });
  const [holidayData, setHolidayData] = useState({ Date: '', Occasion: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const hdrs = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const [uRes, aRes, dRes, rRes, fRes, hRes, pRes, sRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/admin/users', { headers: hdrs }),
        fetch('http://127.0.0.1:8000/admin/announcements', { headers: hdrs }),
        fetch('http://127.0.0.1:8000/admin/details', { headers: hdrs }),
        fetch('http://127.0.0.1:8000/admin/results', { headers: hdrs }),
        fetch('http://127.0.0.1:8000/admin/fees', { headers: hdrs }),
        fetch('http://127.0.0.1:8000/admin/holidays', { headers: hdrs }),
        fetch('http://127.0.0.1:8000/admin/payments', { headers: hdrs }),
        fetch('http://127.0.0.1:8000/admin/salaries', { headers: hdrs })
      ]);
      if(uRes.ok) setUsersList(await uRes.json());
      if(aRes.ok) setAnnouncements(await aRes.json());
      if(dRes.ok) setDetails(await dRes.json());
      if(rRes.ok) setResults(await rRes.json());
      if(fRes.ok) setFees(await fRes.json());
      if(hRes.ok) setHolidays(await hRes.json());
      if(pRes.ok) setPayments(await pRes.json());
      if(sRes.ok) setSalaries(await sRes.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePost = async (e, endpoint, payload, setModalFalse, resetFormFn) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:8000/admin/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setModalFalse(false);
        resetFormFn();
        fetchData();
      } else alert("Failed to deploy changes.");
    } catch (err) { console.error(err); }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const isEditing = !!editingUser;
    const url = isEditing ? `http://127.0.0.1:8000/admin/users/${editingUser.UserId}` : `http://127.0.0.1:8000/admin/users`;
    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) { fetchData(); setShowUserModal(false); } 
      else { const err = await res.json(); alert(`Error: ${err.detail}`); }
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/admin/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) setUsersList(usersList.filter(u => u.UserId !== id));
    } catch (err) {}
  };

  const handlePaySalary = async (id) => {
    if (!window.confirm("Confirm salary payment?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/admin/salaries/${id}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) { fetchData(); }
    } catch (err) {}
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      
      {/* Dynamic Modals Generation Block */}
      {showUserModal && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button>
            </div>
            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label>Full Name</label><input required type="text" value={formData.FullName} onChange={e => setFormData({...formData, FullName: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div>
              <div><label>Email</label><input required type="email" value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div>
              <div>
                <label>Role</label>
                <select value={formData.Role} onChange={e => setFormData({...formData, Role: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="primary-btn">Save SQL Record</button>
            </form>
          </div>
        </div>
      )}

      {showAnnModal && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><h2 style={{ margin: 0 }}>Publish Announcement</h2><button onClick={() => setShowAnnModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button></div>
            <form onSubmit={e => handlePost(e, 'announcements', annData, setShowAnnModal, () => setAnnData({ Title: '', Content: '', DatePosted: new Date().toLocaleDateString() }))} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label>Headline</label><input required type="text" value={annData.Title} onChange={e => setAnnData({...annData, Title: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div>
              <div><label>Message</label><textarea required value={annData.Content} onChange={e => setAnnData({...annData, Content: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box', minHeight: '100px' }}/></div>
              <button type="submit" className="primary-btn" style={{ background: '#ec4899' }}>Live Publish</button>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><h2 style={{ margin: 0 }}>Update Academic Details</h2><button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button></div>
            <form onSubmit={e => handlePost(e, 'details', detailData, setShowDetailModal, () => setDetailData({ DetailType: '', Description: '' }))} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label>Category (e.g., Curriculum Update)</label><input required type="text" value={detailData.DetailType} onChange={e => setDetailData({...detailData, DetailType: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div>
              <div><label>Description</label><textarea required value={detailData.Description} onChange={e => setDetailData({...detailData, Description: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box', minHeight: '100px' }}/></div>
              <button type="submit" className="primary-btn" style={{ background: '#8b5cf6' }}>Save Details DB</button>
            </form>
          </div>
        </div>
      )}

      {showFeeModal && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><h2 style={{ margin: 0 }}>Set Fee Structure</h2><button onClick={() => setShowFeeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button></div>
            <form onSubmit={e => handlePost(e, 'fees', feeData, setShowFeeModal, () => setFeeData({ Program: '', Amount: 0, Deadline: '' }))} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label>Program Name</label><input required type="text" value={feeData.Program} onChange={e => setFeeData({...feeData, Program: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div>
              <div><label>Total Amount ($)</label><input required type="number" value={feeData.Amount} onChange={e => setFeeData({...feeData, Amount: parseFloat(e.target.value)})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div>
              <div><label>Payment Deadline</label><input required type="text" placeholder="e.g. 2026-08-30" value={feeData.Deadline} onChange={e => setFeeData({...feeData, Deadline: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div>
              <button type="submit" className="primary-btn" style={{ background: '#10b981' }}>Update Fee Registry</button>
            </form>
          </div>
        </div>
      )}

      {showResultModal && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><h2 style={{ margin: 0 }}>Upload Result Links</h2><button onClick={() => setShowResultModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button></div>
            <form onSubmit={e => handlePost(e, 'results', resultData, setShowResultModal, () => setResultData({ Semester: '', LinkFormat: '' }))} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label>Semester Label</label><input required type="text" value={resultData.Semester} onChange={e => setResultData({...resultData, Semester: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div>
              <div><label>Result PDF URI</label><input required type="text" value={resultData.LinkFormat} onChange={e => setResultData({...resultData, LinkFormat: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div>
              <button type="submit" className="primary-btn" style={{ background: '#3b82f6' }}>Upload Resource</button>
            </form>
          </div>
        </div>
      )}

      {showHolidayModal && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><h2 style={{ margin: 0 }}>Assign Holiday</h2><button onClick={() => setShowHolidayModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button></div>
            <form onSubmit={e => handlePost(e, 'holidays', holidayData, setShowHolidayModal, () => setHolidayData({ Date: '', Occasion: '' }))} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label>Holiday Date</label><input required type="text" value={holidayData.Date} onChange={e => setHolidayData({...holidayData, Date: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div>
              <div><label>Occasion Description</label><input required type="text" value={holidayData.Occasion} onChange={e => setHolidayData({...holidayData, Occasion: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div>
              <button type="submit" className="primary-btn" style={{ background: '#f59e0b' }}>Deploy Calendar Event</button>
            </form>
          </div>
        </div>
      )}


      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert style={{ color: '#ef4444' }} /> Administrative Console</h1>
          <p className="page-subtitle">Fully centralized university routing operations.</p>
        </div>
      </div>

      <div className="tabs-nav">
        {[
          { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard width={16}/> },
          { id: 'users', label: 'User Directory', icon: <UserPlus width={16}/> },
          { id: 'academics', label: 'Academic Details', icon: <FileText width={16}/> },
          { id: 'results', label: 'Upload Results', icon: <DownloadCloud width={16}/> },
          { id: 'fees', label: 'Fee Structures', icon: <Landmark width={16}/> },
          { id: 'announcements', label: 'Announcements', icon: <Bell width={16}/> },
          { id: 'holidays', label: 'Holidays', icon: <CalendarDays width={16}/> },
          { id: 'financials', label: 'Financials', icon: <DollarSign width={16}/> }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab ${activeTab === tab.id ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="grid-sections">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {activeTab === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              <div className="panel">
                <div className="panel-header"><h2><DollarSign width={20} height={20} style={{ color: '#f59e0b' }}/> Faculty Salaries Due Node</h2></div>
                <div className="panel-body">
                  {salaries.filter(s => s.Status === 'Pending').length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>All salaries have been paid.</p>
                  ) : (
                    salaries.filter(s => s.Status === 'Pending').map(s => (
                      <div key={s.Id} className="list-item" style={{ borderLeft: '3px solid #f59e0b', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{s.FacultyName}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Month: {s.Month}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>${s.Amount}</div>
                            <button 
                               onClick={() => handlePaySalary(s.Id)}
                               style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '500', cursor: 'pointer', fontSize: '0.875rem' }}
                            >Pay Salary</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header"><h2><CreditCard width={20} height={20} style={{ color: '#ef4444' }}/> Outstanding Student Dues</h2></div>
                <div className="panel-body">
                  {payments.filter(p => p.Status === 'Pending').length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No outstanding student dues.</p>
                  ) : (
                    payments.filter(p => p.Status === 'Pending').map(p => (
                      <div key={p.Id} className="list-item" style={{ borderLeft: '3px solid #ef4444', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.StudentName}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{p.Type}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>${p.Amount}</div>
                            <button 
                               onClick={() => alert("Waiting for student payment via portal.")}
                               style={{ padding: '6px 12px', background: '#f8fafc', color: '#94a3b8', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', cursor: 'not-allowed' }}
                               disabled
                            >Unpaid</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="panel">
              <div className="panel-header"><h2><Database width={20} height={20} style={{ color: '#94a3b8' }}/> Managed Access Directory</h2><button onClick={() => { setEditingUser(null); setFormData({FullName: '', Email: '', Role: 'student'}); setShowUserModal(true); }} className="primary-btn" style={{ background: '#eff6ff', color: '#2563eb' }}><UserPlus width={16}/> Insert User</button></div>
              <div className="table-container">
                {loading ? <p>Loading...</p> : <table>
                  <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Actions</th></tr></thead>
                  <tbody>
                    {usersList.map(u => <tr key={u.UserId}><td>{u.FullName}</td><td>{u.Role}</td><td>{u.Email}</td><td><button onClick={() => { setEditingUser(u); setFormData({FullName: u.FullName, Email: u.Email, Role: u.Role}); setShowUserModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><Edit width={16}/></button><button onClick={() => handleDeleteUser(u.UserId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', marginLeft: '8px' }}><Trash2 width={16}/></button></td></tr>)}
                  </tbody>
                </table>}
              </div>
            </div>
          )}

          {activeTab === 'academics' && (
            <div className="panel">
              <div className="panel-header"><h2>Live Academic Schema Details</h2><button onClick={() => setShowDetailModal(true)} className="primary-btn" style={{ background: '#8b5cf6' }}>Compose Details</button></div>
              <div className="panel-body" style={{ padding: '24px' }}>
                {details.map(d => <div key={d.Id} style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}><h3 style={{ margin: '0 0 8px 0', color: '#8b5cf6' }}>{d.DetailType}</h3><p style={{ margin: 0, fontSize: '0.875rem' }}>{d.Description}</p></div>)}
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="panel">
              <div className="panel-header"><h2>Official Result Manifests</h2><button onClick={() => setShowResultModal(true)} className="primary-btn" style={{ background: '#3b82f6' }}>Upload Results Document</button></div>
              <div className="panel-body" style={{ padding: '24px' }}>
                {results.map(r => <div key={r.Id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #e2e8f0' }}><strong>{r.Semester} Exam Iteration</strong><a href={r.LinkFormat} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: '500' }}>View Records</a></div>)}
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="panel">
              <div className="panel-header"><h2>University Fee Registries</h2><button onClick={() => setShowFeeModal(true)} className="primary-btn" style={{ background: '#10b981' }}>Establish Price Structure</button></div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Program</th><th>Sum</th><th>Action Deadline</th></tr></thead>
                  <tbody>{fees.map(f => <tr key={f.Id}><td>{f.Program}</td><td style={{ fontWeight: '600', color: '#059669' }}>${f.Amount.toLocaleString()}</td><td>{f.Deadline}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
             <div className="panel">
             <div className="panel-header"><h2>Active Global Transmissions</h2><button onClick={() => setShowAnnModal(true)} className="primary-btn" style={{ background: '#ec4899' }}>Deploy Urgent Network Broadcast</button></div>
             <div className="panel-body" style={{ padding: '24px' }}>
               {announcements.map(a => <div key={a.AnnouncementId} style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '12px', borderLeft: '4px solid #ec4899' }}><h3 style={{ margin: '0 0 8px 0', color: '#ec4899' }}>{a.Title}</h3><p style={{ margin: 0, fontSize: '0.875rem' }}>{a.Content}</p><small style={{ color: '#94a3b8', display: 'block', marginTop: '8px' }}>Deployed: {a.DatePosted}</small></div>)}
             </div>
           </div>
          )}

          {activeTab === 'holidays' && (
            <div className="panel">
              <div className="panel-header"><h2>Official Calendar Exceptions</h2><button onClick={() => setShowHolidayModal(true)} className="primary-btn" style={{ background: '#f59e0b' }}>Set Holiday</button></div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Designated Time</th><th>Holiday Reason</th></tr></thead>
                  <tbody>{holidays.map(h => <tr key={h.Id}><td style={{ fontWeight: '600', color: '#d97706' }}>{h.Date}</td><td>{h.Occasion}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="panel">
                <div className="panel-header"><h2>Student Payments Ledger</h2></div>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Payment ID</th><th>Student Name</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.Id}>
                          <td>#{p.Id}</td>
                          <td>{p.StudentName}</td>
                          <td>{p.Type}</td>
                          <td style={{ fontWeight: '600' }}>${p.Amount.toLocaleString()}</td>
                          <td>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: p.Status === 'Paid' ? '#dcfce7' : '#fef3c7', color: p.Status === 'Paid' ? '#166534' : '#b45309' }}>
                              {p.Status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header"><h2>Faculty Salary Disbursement</h2></div>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Target Month</th><th>Faculty Name</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {salaries.map(s => (
                        <tr key={s.Id}>
                          <td>{s.Month}</td>
                          <td>{s.FacultyName}</td>
                          <td style={{ fontWeight: '600' }}>${s.Amount.toLocaleString()}</td>
                          <td>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: s.Status === 'Paid' ? '#dcfce7' : '#fef3c7', color: s.Status === 'Paid' ? '#166534' : '#b45309' }}>
                              {s.Status}
                            </span>
                          </td>
                          <td>
                            {s.Status === 'Pending' ? (
                              <button onClick={() => handlePaySalary(s.Id)} className="primary-btn" style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#3b82f6' }}>Pay Salary</button>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Settled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default AdminPanel;