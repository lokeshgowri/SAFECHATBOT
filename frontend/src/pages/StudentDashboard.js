import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, Clock, FileText, GraduationCap, Bell, X, BarChart2, TrendingUp, AlertCircle, CreditCard
} from 'lucide-react';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ stats: [], schedule: [] });

  const [activeModal, setActiveModal] = useState(null); // 'attendance', 'cgpa', or 'assignments'

  const [dues, setDues] = useState([]);

  const fetchOverview = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/student/overview', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setOverview(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchDues = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/student/dues', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setDues(await res.json());
    } catch(err) {}
  };

  useEffect(() => { fetchOverview(); fetchDues(); }, []);

  const handlePayment = async (dueId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/student/dues/${dueId}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if(res.ok) {
        fetchDues();
      }
    } catch(err) {}
  };

  const pendingDuesCount = dues.filter(d => d.Status === 'Pending').length;

  const stats = [
    { id: 'attendance', label: "Overall Attendance", value: "85%" },
    { id: 'cgpa', label: "Current SGPA", value: "3.8" },
    { id: 'assignments', label: "Assignments Due", value: "3" },
    { id: 'dues', label: "Fee Dues", value: pendingDuesCount.toString() },
  ];

  const iconsMap = {
    attendance: <Calendar className="w-6 h-6 text-blue-500" />,
    cgpa: <GraduationCap className="w-6 h-6 text-green-500" />,
    assignments: <FileText className="w-6 h-6 text-orange-500" />,
    dues: <CreditCard className="w-6 h-6 text-red-500" />
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      
      {/* Dynamic Native Modals */}
      {activeModal === 'attendance' && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '450px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 width={20} style={{ color: '#3b82f6' }}/> Attendance Registry</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button>
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', padding: '12px 0' }}><strong>Semester 1</strong> <span style={{ color: '#10b981', fontWeight: '500' }}>92%</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', padding: '12px 0' }}><strong>Semester 2</strong> <span style={{ color: '#10b981', fontWeight: '500' }}>88%</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', padding: '12px 0' }}><strong>Semester 3</strong> <span style={{ color: '#f59e0b', fontWeight: '500' }}>79%</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', background: '#f8fafc', borderRadius: '4px', marginTop: '8px' }}><strong style={{ color: '#334155' }}>Current (Sem 4)</strong> <span style={{ color: '#3b82f6', fontWeight: '600' }}>85%</span></div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'cgpa' && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '450px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp width={20} style={{ color: '#10b981' }}/> Academic SGPA Tracking</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button>
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', padding: '12px 0' }}><strong>Semester 1 (Freshman)</strong> <span>3.6 SGPA</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', padding: '12px 0' }}><strong>Semester 2 (Freshman)</strong> <span>3.9 SGPA</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', padding: '12px 0' }}><strong>Semester 3 (Sophomore)</strong> <span>3.7 SGPA</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', background: '#ecfdf5', borderRadius: '4px', marginTop: '8px' }}><strong style={{ color: '#065f46' }}>Cumulative CGPA</strong> <strong style={{ color: '#10b981', fontSize: '1.25rem' }}>3.73</strong></div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'assignments' && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '450px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle width={20} style={{ color: '#f59e0b' }}/> Active Due Assignments</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button>
            </div>
            <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ borderLeft: '3px solid #ef4444', padding: '12px', background: '#fef2f2', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 4px 0', color: '#991b1b' }}>Advanced Database Systems (Essay)</h4>
                <div style={{ fontSize: '0.875rem', color: '#b91c1c' }}>Due Tonight @ 11:59 PM</div>
              </div>
              <div style={{ borderLeft: '3px solid #f59e0b', padding: '12px', background: '#fffbeb', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 4px 0', color: '#b45309' }}>Computer Networks (Lab Report 4)</h4>
                <div style={{ fontSize: '0.875rem', color: '#d97706' }}>Due in 2 Days</div>
              </div>
              <div style={{ borderLeft: '3px solid #3b82f6', padding: '12px', background: '#eff6ff', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 4px 0', color: '#1e40af' }}>AI Engineering (Programming Assignment)</h4>
                <div style={{ fontSize: '0.875rem', color: '#2563eb' }}>Due in 5 Days</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'dues' && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '550px', padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard width={20} style={{ color: '#ef4444' }}/> Fee & Payments Info</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button>
            </div>
            <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dues.length === 0 && <p>No dues found.</p>}
              {dues.map(due => (
                <div key={due.Id} style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: due.Status === 'Paid' ? '#f8fafc' : '#fff' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: due.Status === 'Paid' ? '#64748b' : '#0f172a' }}>{due.Type}</h4>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Due Date: {due.DueDate || 'N/A'} &middot; Status: <strong style={{ color: due.Status === 'Paid' ? '#10b981' : '#f59e0b' }}>{due.Status}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>${due.Amount}</div>
                    {due.Status === 'Pending' && (
                      <button 
                        onClick={() => handlePayment(due.Id)}
                        style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Overview</h1>
          <p className="page-subtitle">Welcome back! Here is your academic summary.</p>
        </div>
      </div>

      <div className="grid-cards">
        {stats.map((stat) => (
          <div key={stat.id} className="card" onClick={() => setActiveModal(stat.id)} style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid transparent' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <div className="card-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              {iconsMap[stat.id]}
            </div>
            <div className="card-content">
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>Click to view details</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-sections">
        <div className="panel">
          <div className="panel-header"><h2><Clock style={{ color: '#3b82f6', width: 20, height: 20 }}/> Today's Classes</h2></div>
          <div className="panel-body">
            {loading ? <p>Loading classes...</p> : overview.schedule.map((cls) => (
              <div key={cls.ScheduleId} className="list-item">
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', width: '80px' }}>{cls.Time}</div>
                  <div><div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{cls.CourseName}</div><div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{cls.Room}</div></div>
                </div>
                <span className="badge" style={{ backgroundColor: cls.Status === 'Canceled' ? '#fee2e2' : '#dcfce7', color: cls.Status === 'Canceled' ? '#991b1b' : '#166534' }}>{cls.Status}</span>
              </div>
            ))}
            {!loading && overview.schedule.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No classes scheduled today.</p>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="panel">
            <div className="panel-header"><h2><BookOpen style={{ color: '#6366f1', width: 20, height: 20 }}/> Study Materials</h2></div>
            <div className="panel-body" style={{ padding: '16px 24px' }}>
              {['AI Notes Unit 1.pdf', 'Database Schema Reference.docx'].map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0 border-bottom: 1px solid #e2e8f0', cursor: 'pointer' }}>
                  <FileText style={{ color: '#94a3b8', width: 16, height: 16 }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)' }}>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="highlight-widget">
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
               <Bell style={{ width: 24, height: 24, color: '#93c5fd' }} />
               <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Upcoming Quiz</h3>
             </div>
             <p style={{ fontSize: '0.875rem', color: '#bfdbfe', marginBottom: '16px' }}>Data Structures Mid-Term is scheduled for Friday at 10:00 AM.</p>
             <button style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>View Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;