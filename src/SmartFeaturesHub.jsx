import React, { useState, useEffect } from 'react';

export default function SmartFeaturesHub({ 
  user, 
  workspaceData, 
  saveWorkspaceData, 
  usersList = [], 
  refreshUsers 
}) {
  const isAdmin = user?.role === 'admin' || user?.access_type === 'edit';

  // --- 1. HIGH-PRIORITY NOTICE & LIVE EXAM COUNTDOWN ---
  const [notice, setNotice] = useState(workspaceData?.pinnedNotice || '📢 আগামী রবিবার মিডটার্ম পরীক্ষার রুটিন প্রকাশিত হবে!');
  const [examTitle, setExamTitle] = useState(workspaceData?.examCountdown?.title || 'Midterm Examination');
  const [examDate, setExamDate] = useState(workspaceData?.examCountdown?.date || '2026-12-01T09:00');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(examDate) - new Date();
      if (diff <= 0) {
        setTimeLeft('🎉 Exam Started / Completed!');
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${d}d : ${h}h : ${m}m : ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [examDate]);

  const handleSaveAlert = () => {
    saveWorkspaceData({
      ...workspaceData,
      pinnedNotice: notice,
      examCountdown: { title: examTitle, date: examDate }
    });
  };

  // --- 2. SMART TOOLS: POMODORO, CGPA & ATTENDANCE ---
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (pomoRunning && pomoSeconds > 0) {
      interval = setInterval(() => setPomoSeconds((s) => s - 1), 1000);
    } else if (pomoSeconds === 0) {
      setPomoRunning(false);
      alert('⏰ ফোকাস সেশন সম্পন্ন হয়েছে! ৫ মিনিট বিশ্রাম নিন।');
    }
    return () => clearInterval(interval);
  }, [pomoRunning, pomoSeconds]);

  const [attended, setAttended] = useState(18);
  const [totalClasses, setTotalClasses] = useState(22);
  const attendancePct = totalClasses > 0 ? ((attended / totalClasses) * 100).toFixed(1) : 0;

  const [courses, setCourses] = useState([{ credit: 3, gpa: 3.75 }, { credit: 3, gpa: 4.00 }]);
  const totalCredits = courses.reduce((acc, c) => acc + Number(c.credit || 0), 0);
  const cgpa = totalCredits > 0 
    ? (courses.reduce((acc, c) => acc + Number(c.credit || 0) * Number(c.gpa || 0), 0) / totalCredits).toFixed(2) 
    : '0.00';

  // --- 3. IN-APP FILE PREVIEW, SEARCH & QUICK SHARE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('All');
  const [previewFile, setPreviewFile] = useState(null);

  const shareToWhatsApp = (title, info = '') => {
    const text = `📚 *Varsity Portal Update*\n📌 *${title}*\n${info}\n🔗 ভিজিট করুন: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // --- 4. Q&A / DOUBT CLEARING THREAD ---
  const [questionText, setQuestionText] = useState('');
  const discussions = workspaceData?.discussions || [];

  const handlePostQuestion = () => {
    if (!questionText.trim()) return;
    const newPost = {
      id: Date.now(),
      author: user?.username || 'Student',
      text: questionText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    saveWorkspaceData({ ...workspaceData, discussions: [newPost, ...discussions] });
    setQuestionText('');
  };

  // --- 5. ADMIN USER DELETE, PASSWORD RESET & JSON BACKUP ---
  const handleDeleteUser = async (username) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${username}" ইউজারকে ডিলিট করতে চান?`)) return;
    const res = await fetch(`/api/users/${username}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success && refreshUsers) refreshUsers();
    else alert(data.error || 'ডিলিট করা যায়নি!');
  };

  const handleResetPassword = async (username) => {
    const newPassword = window.prompt(`"${username}" এর জন্য নতুন পাসওয়ার্ড লিখুন:`);
    if (!newPassword) return;
    const res = await fetch('/api/users/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, newPassword })
    });
    const data = await res.json();
    if (data.success) alert('✅ পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
  };

  const exportBackupJSON = () => {
    const blob = new Blob([JSON.stringify(workspaceData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `varsity-portal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importBackupJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        saveWorkspaceData(parsed);
        alert('✅ ব্যাকআপ ফাইল সফলভাবে রিস্টোর হয়েছে!');
      } catch (err) {
        alert('❌ ভুল JSON ফাইল!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '16px 0', color: '#f8fafc' }}>
      
      {/* 1. HIGH-PRIORITY NOTICE BANNER & LIVE EXAM COUNTDOWN */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid #ef4444', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ background: '#ef4444', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              LIVE NOTICE
            </span>
            <p style={{ margin: '8px 0 0', fontSize: '15px', fontWeight: '500' }}>{notice}</p>
          </div>
          <div style={{ background: '#090d16', padding: '10px 16px', borderRadius: '10px', border: '1px solid #334155', textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>⏳ {examTitle}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', fontFamily: 'monospace' }}>{timeLeft}</div>
          </div>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => shareToWhatsApp(notice, `Exam: ${examTitle} (${timeLeft})`)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
            📲 Share Notice on WhatsApp
          </button>
          {isAdmin && (
            <>
              <input value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="Update Notice..." style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '6px', flex: 1 }} />
              <input value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="Exam Title" style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '6px', width: '140px' }} />
              <input type="datetime-local" value={examDate} onChange={(e) => setExamDate(e.target.value)} style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '6px' }} />
              <button onClick={handleSaveAlert} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
            </>
          )}
        </div>
      </div>

      {/* 2. SMART STUDENT PRODUCTIVITY BAR: POMODORO, ATTENDANCE & CGPA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        
        {/* Pomodoro Study Timer */}
        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h4 style={{ margin: '0 0 8px', color: '#f43f5e' }}>🍅 Focus Study Timer</h4>
          <div style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace', margin: '10px 0' }}>
            {String(Math.floor(pomoSeconds / 60)).padStart(2, '0')}:{String(pomoSeconds % 60).padStart(2, '0')}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setPomoRunning(!pomoRunning)} style={{ background: pomoRunning ? '#eab308' : '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
              {pomoRunning ? 'Pause' : 'Start Focus'}
            </button>
            <button onClick={() => { setPomoRunning(false); setPomoSeconds(25 * 60); }} style={{ background: '#475569', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
              Reset
            </button>
          </div>
        </div>

        {/* Attendance Calculator */}
        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h4 style={{ margin: '0 0 8px', color: '#38bdf8' }}>📊 Attendance Tracker</h4>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '12px' }}>Present: <input type="number" value={attended} onChange={(e) => setAttended(e.target.value)} style={{ width: '55px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '4px', borderRadius: '4px' }} /></label>
            <label style={{ fontSize: '12px' }}>Total: <input type="number" value={totalClasses} onChange={(e) => setTotalClasses(e.target.value)} style={{ width: '55px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '4px', borderRadius: '4px' }} /></label>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: attendancePct >= 75 ? '#4ade80' : '#f87171' }}>
            Attendance: {attendancePct}% {attendancePct < 75 && '(⚠️ Low)'}
          </div>
        </div>

        {/* Quick CGPA Calculator */}
        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: '#a855f7' }}>🎓 Quick CGPA</h4>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#c084fc' }}>{cgpa}</span>
          </div>
          <div style={{ maxHeight: '75px', overflowY: 'auto', margin: '8px 0' }}>
            {courses.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                <input type="number" step="0.5" placeholder="Cr" value={c.credit} onChange={(e) => { const updated = [...courses]; updated[idx].credit = e.target.value; setCourses(updated); }} style={{ width: '50%', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '3px', borderRadius: '4px', fontSize: '12px' }} />
                <input type="number" step="0.25" placeholder="GPA" value={c.gpa} onChange={(e) => { const updated = [...courses]; updated[idx].gpa = e.target.value; setCourses(updated); }} style={{ width: '50%', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '3px', borderRadius: '4px', fontSize: '12px' }} />
              </div>
            ))}
          </div>
          <button onClick={() => setCourses([...courses, { credit: 3, gpa: 4.0 }])} style={{ background: '#334155', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>
            + Add Course
          </button>
        </div>
      </div>

      {/* 3. INSTANT MATERIAL SEARCH, TAG FILTER & IN-APP PREVIEW */}
      <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0 }}>🔍 Instant File Finder & In-App Preview</h4>
          <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '450px' }}>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="কোর্স কোড বা টপিকের নাম লিখুন..." style={{ flex: 1, background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }}>
              <option value="All">All Types</option>
              <option value="PDF">PDF</option>
              <option value="Slide">Slide</option>
              <option value="Note">Note</option>
              <option value="Question">Question</option>
            </select>
          </div>
        </div>

        {/* Modal for In-App PDF/Image Preview */}
        {previewFile && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', zIndex: 9999, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>{previewFile.title || 'File Preview'}</h3>
              <button onClick={() => setPreviewFile(null)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                ✕ Close Preview
              </button>
            </div>
            <iframe src={previewFile.url || previewFile.data} style={{ width: '100%', flex: 1, borderRadius: '8px', background: '#fff', border: 'none' }} title="In-App Preview" />
          </div>
        )}
      </div>

      {/* 4. Q&A / DOUBT CLEARING DISCUSSION BOARD */}
      <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
        <h4 style={{ margin: '0 0 12px' }}>💬 Student Q&A / Doubt Clearing Thread</h4>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="কোনো লেকচার বা পরীক্ষার বিষয়ে প্রশ্ন থাকলে লিখুন..." style={{ flex: 1, background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
          <button onClick={handlePostQuestion} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
            Post
          </button>
        </div>
        <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {discussions.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>এখনো কোনো প্রশ্ন পোস্ট করা হয়নি।</div>
          ) : (
            discussions.map((d) => (
              <div key={d.id} style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px' }}>
                <strong style={{ color: '#38bdf8' }}>{d.author}</strong> <span style={{ color: '#64748b', fontSize: '11px' }}>({d.time})</span>: {d.text}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. ADMIN CONTROL: USER DELETE, PASSWORD RESET & ONE-CLICK BACKUP */}
      {isAdmin && (
        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, color: '#10b981' }}>🛡️ Advanced Admin Control & JSON Backup</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={exportBackupJSON} style={{ background: '#059669', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                ⬇️ Export Full Backup (JSON)
              </button>
              <label style={{ background: '#2563eb', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                ⬆️ Restore JSON
                <input type="file" accept=".json" onChange={importBackupJSON} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {usersList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {usersList.map((u) => (
                <div key={u.username} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <div>
                    <strong>{u.username}</strong> <span style={{ fontSize: '12px', color: '#94a3b8' }}>({u.role} | Last Active: {u.last_active || 'N/A'})</span>
                  </div>
                  {u.username !== 'admin' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleResetPassword(u.username)} style={{ background: '#eab308', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        🔑 Reset Pass
                      </button>
                      <button onClick={() => handleDeleteUser(u.username)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}