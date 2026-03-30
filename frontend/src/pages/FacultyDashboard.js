import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, CalendarCheck, Plus, X, Link as LinkIcon, HelpCircle, DollarSign
} from 'lucide-react';

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('marks');
  const [marks, setMarks] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [links, setLinks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const [markForm, setMarkForm] = useState({ StudentName: '', CourseName: '', Midterm: 0, Final: 0 });
  const [classForm, setClassForm] = useState({ CourseName: '', Time: '', Room: '' });
  const [linkForm, setLinkForm] = useState({ Topic: '', Url: '' });
  const [quizForm, setQuizForm] = useState({ CourseName: '', Date: '', Topics: '' });

  const fetchData = async () => {
    try {
      const hdrs = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const [mRes, sRes, lRes, qRes, salRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/faculty/marks', { headers: hdrs }),
        fetch('http://127.0.0.1:8000/faculty/schedule', { headers: hdrs }),
        fetch('http://127.0.0.1:8000/faculty/links', { headers: hdrs }),
        fetch('http://127.0.0.1:8000/faculty/quizzes', { headers: hdrs }),
        fetch('http://127.0.0.1:8000/faculty/salary', { headers: hdrs })
      ]);
      if (mRes.ok) setMarks(await mRes.json());
      if (sRes.ok) setSchedule(await sRes.json());
      if (lRes.ok) setLinks(await lRes.json());
      if (qRes.ok) setQuizzes(await qRes.json());
      if (salRes.ok) setSalaries(await salRes.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePost = async (e, endpoint, payload, setModalFalse, resetFormFn) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:8000/faculty/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) { setModalFalse(false); resetFormFn(); fetchData(); } 
      else alert("Failed to deploy changes.");
    } catch (err) { console.error(err); }
  };

  const updateScheduleStatus = async (scheduleId, status) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/faculty/schedule/${scheduleId}?status=${status}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) setSchedule(schedule.map(s => s.ScheduleId === scheduleId ? { ...s, Status: status } : s));
    } catch (err) {}
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files[0]) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      alert("Indexing file in the background...");
      await fetch('http://127.0.0.1:8000/upload/', {
        method: 'POST',
        body: formData
      });
      alert("File uploaded and AI RAG Indexed successfully!");
    } catch (error) {
       console.error(error);
       alert("Error uploading document to backend server.");
    }
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>

      {showMarkModal && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="panel" style={{ width: '400px', padding: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><h2 style={{ margin: 0 }}>Add New Record</h2><button onClick={() => setShowMarkModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button></div><form onSubmit={e => handlePost(e, 'marks', markForm, setShowMarkModal, () => setMarkForm({ StudentName: '', CourseName: '', Midterm: 0, Final: 0 }))} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}><div><label>Student Full Name</label><input required type="text" value={markForm.StudentName} onChange={e => setMarkForm({...markForm, StudentName: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div><div><label>Course</label><input required type="text" value={markForm.CourseName} onChange={e => setMarkForm({...markForm, CourseName: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div><button type="submit" className="primary-btn" style={{ justifyContent: 'center' }}>Save Record in DB</button></form></div></div>
      )}

      {showClassModal && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="panel" style={{ width: '400px', padding: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><h2 style={{ margin: 0 }}>Schedule New Class</h2><button onClick={() => setShowClassModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button></div><form onSubmit={e => handlePost(e, 'schedule', classForm, setShowClassModal, () => setClassForm({ CourseName: '', Time: '', Room: '' }))} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}><div><label>Course Name</label><input required type="text" value={classForm.CourseName} onChange={e => setClassForm({...classForm, CourseName: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div><div><label>Time</label><input required type="text" placeholder="e.g. 10:00 AM - 12:00 PM" value={classForm.Time} onChange={e => setClassForm({...classForm, Time: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div><div><label>Room</label><input required type="text" value={classForm.Room} onChange={e => setClassForm({...classForm, Room: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div><button type="submit" className="primary-btn" style={{ justifyContent: 'center' }}>Publish to DB</button></form></div></div>
      )}

      {showLinkModal && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="panel" style={{ width: '400px', padding: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><h2 style={{ margin: 0 }}>Add Reference Link</h2><button onClick={() => setShowLinkModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button></div><form onSubmit={e => handlePost(e, 'links', linkForm, setShowLinkModal, () => setLinkForm({ Topic: '', Url: '' }))} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}><div><label>Topic Name</label><input required type="text" value={linkForm.Topic} onChange={e => setLinkForm({...linkForm, Topic: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div><div><label>URL String</label><input required type="url" value={linkForm.Url} onChange={e => setLinkForm({...linkForm, Url: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div><button type="submit" className="primary-btn" style={{ background: '#8b5cf6' }}>Save Network Resource</button></form></div></div>
      )}

      {showQuizModal && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="panel" style={{ width: '400px', padding: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><h2 style={{ margin: 0 }}>Schedule Upcoming Quiz</h2><button onClick={() => setShowQuizModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X width={20}/></button></div><form onSubmit={e => handlePost(e, 'quizzes', quizForm, setShowQuizModal, () => setQuizForm({ CourseName: '', Date: '', Topics: '' }))} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}><div><label>Subject</label><input required type="text" value={quizForm.CourseName} onChange={e => setQuizForm({...quizForm, CourseName: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div><div><label>Exact Date (YYYY-MM-DD)</label><input required type="text" value={quizForm.Date} onChange={e => setQuizForm({...quizForm, Date: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div><div><label>Modules Covered</label><textarea required value={quizForm.Topics} onChange={e => setQuizForm({...quizForm, Topics: e.target.value})} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }}/></div><button type="submit" className="primary-btn" style={{ background: '#ec4899' }}>Deploy Assessment Schema</button></form></div></div>
      )}


      <div className="page-header">
        <div><h1 className="page-title">Faculty Portal</h1><p className="page-subtitle">Manage dynamic DB structures natively formatting content for student accounts.</p></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="primary-btn" onClick={() => setShowClassModal(true)} style={{ background: '#3b82f6' }}><CalendarCheck width={16} height={16} /> Add Class</button>
        </div>
      </div>

      <div className="tabs-nav">
        {[
          { id: 'marks', label: 'Manage Grades' },
          { id: 'resources', label: 'Upload Notes' },
          { id: 'links', label: 'Reference Links' },
          { id: 'quizzes', label: 'Schedule Quiz' },
          { id: 'salary', label: 'My Salary Log' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab ${activeTab === tab.id ? 'active' : ''}`}>{tab.label}</button>
        ))}
      </div>

      <div className="grid-sections">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {activeTab === 'marks' && (
            <div className="panel">
              <div className="panel-header"><h2>Assign Grades</h2><button onClick={() => setShowMarkModal(true)} className="primary-btn" style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}><Plus width={16} height={16} /> New Mark</button></div>
              <div className="table-container">
                {loading ? <p>Loading...</p> : <table>
                    <thead><tr><th>Student Name</th><th>Course</th><th>Midterm</th><th>Final</th><th>Action</th></tr></thead>
                    <tbody>
                      {marks.map((mark) => (
                        <tr key={mark.MarkId}><td style={{ fontWeight: '500' }}>{mark.StudentName}</td><td>{mark.CourseName}</td><td>{mark.Midterm}</td><td>{mark.Final}</td><td style={{ color: '#10b981' }}>Locked in SQL DB</td></tr>
                      ))}
                      {marks.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No academic records found in DB. Add one above!</td></tr>}
                    </tbody>
                  </table>}
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
             <div className="panel">
               <div className="panel-header"><h2>Index AI Learning Material</h2></div>
               <div className="panel-body">
                 <div className="upload-zone" style={{ position: 'relative' }}>
                    <UploadCloud style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 16px auto' }} />
                    <p style={{ fontWeight: '500', color: 'var(--text-main)', margin: '0 0 4px 0' }}>Click to upload file securely</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>PDF, DOCX, JPG, PNG (Max 10MB)</p>
                    <input type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'links' && (
             <div className="panel">
               <div className="panel-header"><h2><LinkIcon width={18}/> Managed Curriculum Resources</h2><button onClick={() => setShowLinkModal(true)} className="primary-btn" style={{ background: '#8b5cf6' }}>Provision Link SQL Record</button></div>
               <div className="table-container">
                 {loading ? <p>Loading...</p> : <table>
                    <thead><tr><th>Educational Topic Node</th><th>Hyperlink Target</th></tr></thead>
                    <tbody>{links.map(l => <tr key={l.Id}><td style={{ fontWeight: '500' }}>{l.Topic}</td><td><a href={l.Url} target="_blank" rel="noreferrer" style={{ color: '#8b5cf6' }}>Navigate Source</a></td></tr>)}</tbody>
                 </table>}
               </div>
             </div>
          )}

          {activeTab === 'quizzes' && (
             <div className="panel">
               <div className="panel-header"><h2><HelpCircle width={18}/> Scheduled Assessments Protocol</h2><button onClick={() => setShowQuizModal(true)} className="primary-btn" style={{ background: '#ec4899' }}>Deploy Evaluation Window</button></div>
               <div className="table-container">
                 {loading ? <p>Loading...</p> : <table>
                    <thead><tr><th>Date Executable</th><th>Target Course Segment</th><th>Topic Constraints</th></tr></thead>
                    <tbody>{quizzes.map(q => <tr key={q.Id}><td style={{ fontWeight: '600', color: '#ec4899' }}>{q.Date}</td><td>{q.CourseName}</td><td>{q.Topics}</td></tr>)}</tbody>
                 </table>}
               </div>
             </div>
          )}

          {activeTab === 'salary' && (
             <div className="panel">
               <div className="panel-header"><h2><DollarSign width={18}/> Compensation History</h2></div>
               <div className="table-container">
                 {loading ? <p>Loading...</p> : <table>
                    <thead><tr><th>Period (Month)</th><th>Gross Amount</th><th>Status</th><th>Disbursement Date</th></tr></thead>
                    <tbody>{salaries.map(s => <tr key={s.Id}><td>{s.Month}</td><td style={{ fontWeight: '600' }}>${s.Amount.toLocaleString()}</td><td><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: s.Status === 'Paid' ? '#dcfce7' : '#fef3c7', color: s.Status === 'Paid' ? '#166534' : '#b45309' }}>{s.Status}</span></td><td style={{ color: '#64748b' }}>{s.PaidAt ? new Date(s.PaidAt).toLocaleDateString() : 'N/A'}</td></tr>)}</tbody>
                 </table>}
                 {salaries.length === 0 && !loading && <p style={{ padding: '16px', color: '#64748b' }}>No salary records available.</p>}
               </div>
             </div>
          )}

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="highlight-widget" style={{ background: 'var(--bg-sidebar)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontSize: '1.125rem' }}>
              <CalendarCheck style={{ color: '#60a5fa' }} /> Live DB Schedule Status
            </h3>
            {loading ? <p>Loading...</p> : schedule.map(s => (
              <div key={s.ScheduleId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                <div><div style={{ fontWeight: '500', color: 'white' }}>{s.CourseName}</div><div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>{s.Time} &middot; {s.Room}</div></div>
                <select value={s.Status} onChange={e => updateScheduleStatus(s.ScheduleId, e.target.value)} style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', outline: 'none' }}>
                  <option value="On Time">On Time</option>
                  <option value="Canceled">Canceled</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FacultyDashboard;
