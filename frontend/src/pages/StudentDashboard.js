import React, { useState, useEffect } from 'react';
import {
  BookOpen, Calendar, Clock, FileText, GraduationCap, Bell, X, BarChart2, TrendingUp, AlertCircle, CreditCard, Bookmark
} from 'lucide-react';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ stats: [], schedule: [], marks: [] });

  const [activeModal, setActiveModal] = useState(null); // 'attendance', 'cgpa', or 'assignments'

  const [dues, setDues] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [links, setLinks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [details, setDetails] = useState([]);
  const [results, setResults] = useState([]);
  const [fees, setFees] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/student/overview`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setOverview(await res.json());
    } catch (err) {  }
    finally { setLoading(false); }
  };

  const fetchDues = async () => {
    try {
      const hdrs = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/student/dues`, { headers: hdrs });
      if (res.ok) setDues(await res.json());

      const resMat = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/student/materials`, { headers: hdrs });
      if (resMat.ok) setMaterials(await resMat.json());

      const resLinks = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/student/links`, { headers: hdrs });
      if (resLinks.ok) setLinks(await resLinks.json());

      const resQuizzes = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/student/quizzes`, { headers: hdrs });
      if (resQuizzes.ok) setQuizzes(await resQuizzes.json());

      const [aRes, dRes, rRes, fRes, hRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/student/announcements`, { headers: hdrs }),
        fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/student/details`, { headers: hdrs }),
        fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/student/results`, { headers: hdrs }),
        fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/student/fees`, { headers: hdrs }),
        fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/student/holidays`, { headers: hdrs })
      ]);
      if (aRes.ok) setAnnouncements(await aRes.json());
      if (dRes.ok) setDetails(await dRes.json());
      if (rRes.ok) setResults(await rRes.json());
      if (fRes.ok) setFees(await fRes.json());
      if (hRes.ok) setHolidays(await hRes.json());
    } catch (err) { }
  };

  useEffect(() => { fetchOverview(); fetchDues(); }, []);

  const handlePayment = async (dueId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/student/dues/${dueId}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchDues();
      }
    } catch (err) { }
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
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 width={20} style={{ color: '#3b82f6' }} /> Attendance Registry</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20} /></button>
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
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp width={20} style={{ color: '#10b981' }} /> Academic SGPA Tracking</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20} /></button>
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
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle width={20} style={{ color: '#f59e0b' }} /> Active Due Assignments</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20} /></button>
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
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard width={20} style={{ color: '#ef4444' }} /> Fee & Payments Info</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20} /></button>
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
        {/* Left Column (Wider, 2fr) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div className="panel">
            <div className="panel-header"><h2><GraduationCap style={{ color: '#10b981', width: 20, height: 20 }} /> My Academic Performance (Grades)</h2></div>
            <div className="table-container" style={{ padding: '0 24px 24px 24px' }}>
              {!overview.marks || overview.marks.length === 0 ? <p style={{ color: 'var(--text-muted)', paddingTop: '16px' }}>No academic records uploaded by faculty yet.</p> :
                <table style={{ width: '100%', marginTop: '16px' }}>
                  <thead><tr><th style={{ textAlign: 'left' }}>Course Program</th><th>Midterm Score</th><th>Midterm2 Score</th><th>Final Score</th><th>Total Aggregate</th></tr></thead>
                  <tbody>
                    {overview.marks.map((mark) => {
                      const avg = ((mark.Midterm + mark.Midterm2 + mark.Final) / 3).toFixed(1);
                      return (
                        <tr key={mark.MarkId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ fontWeight: '500', padding: '12px 0' }}>{mark.CourseName}</td>
                          <td style={{ textAlign: 'center' }}>{mark.Midterm}</td>
                          <td style={{ textAlign: 'center' }}>{mark.Midterm2}</td>
                          <td style={{ textAlign: 'center' }}>{mark.Final}</td>
                          <td style={{ textAlign: 'center', fontWeight: '600', color: '#059669' }}>{avg}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              }
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><h2><BookOpen style={{ color: '#6366f1', width: 20, height: 20 }} /> Study Materials (Uploaded Indexes)</h2></div>
            <div className="panel-body" style={{ padding: '16px 24px' }}>
              {materials.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No resources uploaded by faculty yet.</p> : materials.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  <FileText style={{ color: '#94a3b8', width: 16, height: 16 }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)' }}>
                    <a href={`http://127.0.0.1:8000/uploads/${doc.filename}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                      {doc.filename}
                    </a>
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#10b981' }}>Indexed in FAISS</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><h2><Bookmark style={{ color: '#8b5cf6', width: 20, height: 20 }} /> Reference Links</h2></div>
            <div className="panel-body" style={{ padding: '16px 24px' }}>
              {links.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No reference links available.</p> : links.map((link, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)' }}>
                    {link.Topic}
                  </span>
                  <span style={{ marginLeft: 'auto' }}>
                    <a href={link.Url} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', color: '#3b82f6', textDecoration: 'none' }}>Visit Link</a>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><h2><FileText style={{ color: '#f59e0b', width: 20, height: 20 }} /> Academic Details</h2></div>
            <div className="panel-body" style={{ padding: '16px 24px' }}>
              {details.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No academic details found.</p> : details.map((d, i) => (
                <div key={d.Id} style={{ background: '#fef3c7', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#b45309' }}>{d.DetailType}</h4>
                  <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0 }}>{d.Description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><h2><CreditCard style={{ color: '#10b981', width: 20, height: 20 }} /> Current Fee Structure</h2></div>
            <div className="panel-body" style={{ padding: '16px 24px' }}>
              {fees.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No fee structures loaded.</p> : fees.map(f => (
                <div key={f.Id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>{f.Program}</span>
                  <strong>${f.Amount}</strong>
                  <span style={{ color: '#94a3b8' }}>Due: {f.Deadline}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Narrower, 1fr) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div className="panel">
            <div className="panel-header"><h2><Clock style={{ color: '#3b82f6', width: 20, height: 20 }} /> Today's Classes</h2></div>
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

          <div className="panel">
            <div className="panel-header"><h2><CreditCard style={{ color: '#ef4444', width: 20, height: 20 }} /> Target Action: Pending Fees</h2></div>
            <div className="panel-body">
              {dues.filter(d => d.Status === 'Pending').length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>You have no pending fee dues.</p>
              ) : (
                dues.filter(d => d.Status === 'Pending').map(due => (
                  <div key={due.Id} className="list-item" style={{ borderLeft: '3px solid #ef4444' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{due.Type}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Due: {due.DueDate || 'N/A'}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>${due.Amount}</div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePayment(due.Id); }}
                          style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '500', cursor: 'pointer', fontSize: '0.875rem' }}
                        >Pay Now</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="highlight-widget">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Bell style={{ width: 24, height: 24, color: '#93c5fd' }} />
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Announcements</h3>
            </div>
            {announcements.length === 0 ? <p style={{ fontSize: '0.875rem', color: '#bfdbfe', marginBottom: '16px' }}>No global announcements.</p> : announcements.map(a => (
              <div key={a.AnnouncementId} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontWeight: '600', color: 'white', margin: '0 0 4px 0' }}>{a.Title}</p>
                <p style={{ fontSize: '0.875rem', color: '#bfdbfe', margin: '0 0 4px 0' }}>{a.Content}</p>
                <small style={{ color: '#93c5fd' }}>{a.DatePosted}</small>
              </div>
            ))}
          </div>

          <div className="highlight-widget">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Bell style={{ width: 24, height: 24, color: '#93c5fd' }} />
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Upcoming Quizzes</h3>
            </div>
            {quizzes.length === 0 ? <p style={{ fontSize: '0.875rem', color: '#bfdbfe', marginBottom: '16px' }}>No upcoming quizzes scheduled.</p> : quizzes.map((quiz, i) => (
              <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '0.875rem', color: '#bfdbfe', margin: '0 0 4px 0' }}>{quiz.CourseName} - {quiz.Date}</p>
                <p style={{ fontSize: '0.75rem', color: 'white', margin: 0 }}>Topics: {quiz.Topics}</p>
              </div>
            ))}
          </div>

          <div className="highlight-widget">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <GraduationCap style={{ width: 24, height: 24, color: '#93c5fd' }} />
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Exam Results</h3>
            </div>
            {results.length === 0 ? <p style={{ fontSize: '0.875rem', color: '#bfdbfe', marginBottom: '16px' }}>No results uploaded.</p> : results.map(r => (
              <div key={r.Id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'white', fontWeight: '500' }}>{r.Semester}</span>
                <a href={r.LinkFormat} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', color: '#60a5fa', textDecoration: 'none' }}>Download</a>
              </div>
            ))}
          </div>

          <div className="highlight-widget">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Calendar style={{ width: 24, height: 24, color: '#93c5fd' }} />
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Holidays</h3>
            </div>
            {holidays.length === 0 ? <p style={{ fontSize: '0.875rem', color: '#bfdbfe', marginBottom: '16px' }}>No holidays.</p> : holidays.map(h => (
              <div key={h.Id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'white' }}>{h.Occasion}</span>
                <span style={{ color: '#bfdbfe' }}>{h.Date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;