import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, Calendar as CalendarIcon, GraduationCap, 
  LogOut, Users, Plus, Trash2, Play, Pause, RotateCcw, Clock, 
  FileText, Download, Share2, Eye, Edit3, FolderOpen, Bell
} from 'lucide-react';

const STORAGE_KEY = "MY_SERVER_PORTAL_PRO_V3";

const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port !== "3000"
  ? "http://localhost:3000"
  : "";

const DAYS_OF_WEEK = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HABIT_DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

const INITIAL_WORKSPACE = {
  tasks: [
    { id: 1, title: "Complete Linear Algebra Determinant Exercise", priority: "High", status: "pending" },
    { id: 2, title: "Setup Role-Based Cloud Server", priority: "High", status: "processing" },
    { id: 3, title: "Fix CORS & Port Routing", priority: "Medium", status: "completed" }
  ],
  habits: [
    { id: 1, name: "Morning Coding (2 Hours)", days: [true, true, true, false, true, false, false] },
    { id: 2, name: "University Lecture Review", days: [true, false, true, true, false, false, false] },
    { id: 3, name: "Exercise & Workout", days: [false, true, false, true, true, false, false] }
  ],
  blogs: [
    { 
      id: 1, 
      title: "Project Architecture & Cloud Setup", 
      category: "MS Word / Note", 
      content: "Welcome to the integrated Word Editor & Document Hub. You can edit this like a Word doc, attach PDF/DOCX/PPTX/XLSX files, read PDFs directly inside the browser, or share anywhere!", 
      date: "Nov 2026",
      fileName: "",
      fileType: "",
      fileData: ""
    }
  ],
  routines: [
    { id: 1, day: "Saturday", startTime: "09:00", endTime: "10:30", subject: "CSE-201: Data Structures", room: "Room 402", instructor: "Dr. Rahman" },
    { id: 2, day: "Monday", startTime: "11:00", endTime: "12:30", subject: "MAT-102: Linear Algebra", room: "Room 305", instructor: "Prof. Karim" },
    { id: 3, day: "Wednesday", startTime: "14:00", endTime: "16:00", subject: "CSE-202: Algorithms Lab", room: "Lab 3", instructor: "Engr. Tareq" }
  ],
  varsityNotices: [
    { id: 1, title: "Midterm Examination Schedule Published", course: "All Courses", date: "2026-11-05", content: "All students are requested to check the Exam Calendar on the right panel for exact room numbers and timings." }
  ],
  varsityMaterials: [
    { id: 1, course: "CSE-201: Data Structures", title: "Lecture 01 - Linked Lists & Trees", description: "Complete slide deck and practice problems.", fileName: "sample-note.txt", fileType: "text/plain", fileData: "data:text/plain;base64,RGF0YSBTdHJ1Y3R1cmVzIExlY3R1cmUgTm90ZXM=", date: "2026-11-01" },
    { id: 2, course: "MAT-102: Linear Algebra", title: "Matrix & Determinants Formula Sheet", description: "Step-by-step determinant calculation guide.", fileName: "matrix-guide.txt", fileType: "text/plain", fileData: "data:text/plain;base64,TGluZWFyIEFsZ2VicmEgRm9ybXVsYSBTaGVldA==", date: "2026-11-02" }
  ],
  varsityExams: [
    { id: 1, course: "CSE-201: Data Structures", examType: "Midterm", date: "2026-11-15", time: "10:00 AM", room: "Room 402", syllabus: "Chapters 1 to 4 (Arrays, Stacks, Queues, Trees)" },
    { id: 2, course: "MAT-102: Linear Algebra", examType: "Quiz 2", date: "2026-11-18", time: "11:30 AM", room: "Room 305", syllabus: "Matrices, Determinants & Eigenvalues" }
  ]
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("productivity");

  const [userSession, setUserSession] = useState({
    currentUser: "",
    userRole: "user",
    userPermissions: "varsity",
    userAccessType: "view"
  });

  const [workspace, setWorkspace] = useState(INITIAL_WORKSPACE);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCalDate, setSelectedCalDate] = useState(new Date());
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState("Focus (25m)");

  const [newTask, setNewTask] = useState({ title: "", priority: "Medium", status: "pending" });
  const [newHabitName, setNewHabitName] = useState("");

  const [newBlog, setNewBlog] = useState({ title: "", category: "MS Word / Note", content: "", fileName: "", fileType: "", fileData: "" });
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [selectedRoutineDay, setSelectedRoutineDay] = useState("All");
  const [newRoutine, setNewRoutine] = useState({ day: "Saturday", startTime: "09:00", endTime: "10:30", subject: "", room: "", instructor: "" });

  const [varsitySubTab, setVarsitySubTab] = useState("materials");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("All Courses");
  const [newNotice, setNewNotice] = useState({ title: "", course: "", content: "" });
  const [newMaterial, setNewMaterial] = useState({ course: "", title: "", description: "", fileName: "", fileType: "", fileData: "" });
  const [newExam, setNewExam] = useState({ course: "", examType: "Midterm", date: "", time: "", room: "", syllabus: "" });

  const [userList, setUserList] = useState([]);
  const [newUserForm, setNewUserForm] = useState({ username: "", password: "", name: "", permissions: "varsity", access_type: "view" });
  const [adminMsg, setAdminMsg] = useState("");

  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(s => s - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  useEffect(() => {
    const savedSession = localStorage.getItem("APEX_USER_SESSION_OBJ");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUserSession(parsed);
        setIsAuthenticated(true);
      } catch (e) { console.error(e); }
    }

    const savedLocal = localStorage.getItem(STORAGE_KEY);
    if (savedLocal) {
      try { setWorkspace(prev => ({ ...prev, ...JSON.parse(savedLocal) })); } catch (e) {}
    }

    fetch(`${API_BASE}/api/workspace`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setWorkspace(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, []);

  const syncWorkspace = (updatedWorkspace) => {
    setWorkspace(updatedWorkspace);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorkspace));
    fetch(`${API_BASE}/api/workspace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: updatedWorkspace })
    }).catch(e => console.error("Sync error:", e));
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      const data = await res.json();
      if (data.success) setUserList(data.users);
    } catch (e) {}
  };

  useEffect(() => {
    if (isAuthenticated && userSession.userRole === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, userSession.userRole]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInput)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const sessionObj = {
          currentUser: data.user.username,
          userRole: data.user.role,
          userPermissions: data.user.permissions,
          userAccessType: data.user.access_type
        };
        setUserSession(sessionObj);
        setIsAuthenticated(true);
        localStorage.setItem("APEX_USER_SESSION_OBJ", JSON.stringify(sessionObj));

        let defaultTab = "varsity";
        if (data.user.role === 'admin' || data.user.permissions === 'all') defaultTab = "productivity";
        else if (data.user.permissions?.includes('varsity')) defaultTab = "varsity";
        else if (data.user.permissions?.includes('habits')) defaultTab = "productivity";
        else if (data.user.permissions?.includes('blog')) defaultTab = "blog";
        else if (data.user.permissions?.includes('routine')) defaultTab = "routine";
        setActiveTab(defaultTab);
      } else {
        setLoginError(data.error || "Invalid credentials!");
      }
    } catch (err) {
      setLoginError("Server connection error!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("APEX_USER_SESSION_OBJ");
    setLoginInput({ username: "", password: "" });
  };

  const hasAccess = (permKey) => {
    if (userSession.userRole === 'admin' || userSession.userPermissions === 'all') return true;
    const perms = (userSession.userPermissions || "").split(',').map(s => s.trim());
    return perms.includes(permKey);
  };

  const canModify = userSession.userRole === 'admin' || userSession.userAccessType === 'edit';

  const handleFileUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      callback({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileData: ev.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleShareItem = async (title, text) => {
    const shareText = `${title}\n${text}\nLink: ${window.location.origin}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: window.location.href });
        return;
      } catch (e) {}
    }
    navigator.clipboard.writeText(shareText);
    alert(`📋 Copied "${title}" details & portal link to clipboard! You can now paste & share it anywhere.`);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !canModify) return;
    syncWorkspace({
      ...workspace,
      tasks: [...workspace.tasks, { id: Date.now(), ...newTask }]
    });
    setNewTask({ title: "", priority: "Medium", status: "pending" });
  };

  const changeTaskStatus = (id, newStatus) => {
    if (!canModify) return;
    syncWorkspace({
      ...workspace,
      tasks: workspace.tasks.map(t => t.id === id ? { ...t, status: newStatus } : t)
    });
  };

  const deleteTask = (id) => {
    if (!canModify) return;
    syncWorkspace({ ...workspace, tasks: workspace.tasks.filter(t => t.id !== id) });
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim() || !canModify) return;
    syncWorkspace({
      ...workspace,
      habits: [...workspace.habits, { id: Date.now(), name: newHabitName, days: [false, false, false, false, false, false, false] }]
    });
    setNewHabitName("");
  };

  const toggleHabitDay = (habitId, dayIndex) => {
    if (!canModify) return;
    syncWorkspace({
      ...workspace,
      habits: workspace.habits.map(h => {
        if (h.id !== habitId) return h;
        const newDays = [...h.days];
        newDays[dayIndex] = !newDays[dayIndex];
        return { ...h, days: newDays };
      })
    });
  };

  const deleteHabit = (id) => {
    if (!canModify) return;
    syncWorkspace({ ...workspace, habits: workspace.habits.filter(h => h.id !== id) });
  };

  const saveBlogDocument = (e) => {
    e.preventDefault();
    if (!newBlog.title.trim() || !canModify) return;

    if (editingBlogId) {
      syncWorkspace({
        ...workspace,
        blogs: workspace.blogs.map(b => b.id === editingBlogId ? { ...b, ...newBlog } : b)
      });
      setEditingBlogId(null);
    } else {
      syncWorkspace({
        ...workspace,
        blogs: [{ id: Date.now(), ...newBlog, date: new Date().toLocaleDateString() }, ...workspace.blogs]
      });
    }
    setNewBlog({ title: "", category: "MS Word / Note", content: "", fileName: "", fileType: "", fileData: "" });
  };

  const startEditBlog = (blog) => {
    setEditingBlogId(blog.id);
    setNewBlog({
      title: blog.title,
      category: blog.category,
      content: blog.content,
      fileName: blog.fileName || "",
      fileType: blog.fileType || "",
      fileData: blog.fileData || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteBlog = (id) => {
    if (!canModify) return;
    syncWorkspace({ ...workspace, blogs: workspace.blogs.filter(b => b.id !== id) });
  };

  const addRoutineSlot = (e) => {
    e.preventDefault();
    if (!newRoutine.subject.trim() || !canModify) return;
    syncWorkspace({
      ...workspace,
      routines: [...workspace.routines, { id: Date.now(), ...newRoutine }]
    });
    setNewRoutine({ ...newRoutine, subject: "", room: "", instructor: "" });
  };

  const deleteRoutineSlot = (id) => {
    if (!canModify) return;
    syncWorkspace({ ...workspace, routines: workspace.routines.filter(r => r.id !== id) });
  };

  const addVarsityNotice = (e) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !canModify) return;
    syncWorkspace({
      ...workspace,
      varsityNotices: [{ id: Date.now(), ...newNotice, date: new Date().toISOString().split('T')[0] }, ...workspace.varsityNotices]
    });
    setNewNotice({ title: "", course: "", content: "" });
  };

  const deleteVarsityNotice = (id) => {
    if (!canModify) return;
    syncWorkspace({ ...workspace, varsityNotices: workspace.varsityNotices.filter(n => n.id !== id) });
  };

  const addVarsityMaterial = (e) => {
    e.preventDefault();
    if (!newMaterial.course.trim() || !newMaterial.title.trim() || !canModify) return;
    syncWorkspace({
      ...workspace,
      varsityMaterials: [{ id: Date.now(), ...newMaterial, date: new Date().toISOString().split('T')[0] }, ...workspace.varsityMaterials]
    });
    setNewMaterial({ course: "", title: "", description: "", fileName: "", fileType: "", fileData: "" });
  };

  const deleteVarsityMaterial = (id) => {
    if (!canModify) return;
    syncWorkspace({ ...workspace, varsityMaterials: workspace.varsityMaterials.filter(m => m.id !== id) });
  };

  const addVarsityExam = (e) => {
    e.preventDefault();
    if (!newExam.course.trim() || !newExam.date || !canModify) return;
    syncWorkspace({
      ...workspace,
      varsityExams: [...workspace.varsityExams, { id: Date.now(), ...newExam }]
    });
    setNewExam({ course: "", examType: "Midterm", date: "", time: "", room: "", syllabus: "" });
  };

  const deleteVarsityExam = (id) => {
    if (!canModify) return;
    syncWorkspace({ ...workspace, varsityExams: workspace.varsityExams.filter(x => x.id !== id) });
  };

  const handleUpdateUser = async (username, permissions, access_type) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, permissions, access_type })
      });
      if (res.ok) {
        setAdminMsg(`✅ Updated permissions for "${username}"!`);
        fetchUsers();
        setTimeout(() => setAdminMsg(""), 3000);
      }
    } catch (e) { setAdminMsg("❌ Failed to update user."); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm)
      });
      const data = await res.json();
      if (data.success) {
        setAdminMsg(`✅ Student/User "${newUserForm.username}" created!`);
        setNewUserForm({ username: "", password: "", name: "", permissions: "varsity", access_type: "view" });
        fetchUsers();
      } else { setAdminMsg(`❌ ${data.error}`); }
    } catch (e) { setAdminMsg("❌ Error creating user."); }
  };

  const renderMiniCalendar = () => {
    const year = selectedCalDate.getFullYear();
    const month = selectedCalDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDate = new Date().getDate();
    const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} style={styles.calEmptyCell}></div>);
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = isCurrentMonth && d === todayDate;
      cells.push(
        <div key={d} style={{ ...styles.calDayCell, ...(isToday ? styles.calTodayCell : {}) }}>
          {d}
        </div>
      );
    }

    return (
      <div style={styles.widgetCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <strong style={{ color: '#60a5fa' }}>
            📅 {selectedCalDate.toLocaleString('default', { month: 'long' })} {year}
          </strong>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => setSelectedCalDate(new Date(year, month - 1, 1))} style={styles.miniBtn}>◀</button>
            <button onClick={() => setSelectedCalDate(new Date())} style={styles.miniBtn}>Today</button>
            <button onClick={() => setSelectedCalDate(new Date(year, month + 1, 1))} style={styles.miniBtn}>▶</button>
          </div>
        </div>
        <div style={styles.calGridHeader}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
        </div>
        <div style={styles.calGrid}>{cells}</div>
      </div>
    );
  };

  const uniqueCourses = ["All Courses", ...Array.from(new Set(workspace.varsityMaterials.map(m => m.course)))];
  const sortedExams = [...workspace.varsityExams].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.logoBox}>💻</div>
          <h2 style={styles.loginTitle}>MY SERVER PORTAL</h2>
          {loginError && <div style={styles.errorBox}>{loginError}</div>}
          <form onSubmit={handleLogin} style={styles.form}>
            <label style={styles.label}>USERNAME</label>
            <input type="text" style={styles.input} value={loginInput.username} onChange={e => setLoginInput({ ...loginInput, username: e.target.value })} required />
            <label style={styles.label}>PASSWORD</label>
            <input type="password" style={styles.input} value={loginInput.password} onChange={e => setLoginInput({ ...loginInput, password: e.target.value })} required />
            <button type="submit" style={styles.loginBtn}>ACCESS SERVER</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <div style={styles.brand}>
          ⚡ {userSession.currentUser} 
          <span style={styles.roleTag}>
            {userSession.userRole.toUpperCase()} | {canModify ? "✏️ EDITOR" : "👁️ VIEWER"}
          </span>
        </div>

        <nav style={styles.nav}>
          {hasAccess('habits') && (
            <button onClick={() => setActiveTab("productivity")} style={{ ...styles.navBtn, ...(activeTab === "productivity" ? styles.activeNavBtn : {}) }}>
              <LayoutDashboard size={16} /> Productivity
            </button>
          )}
          {hasAccess('blog') && (
            <button onClick={() => setActiveTab("blog")} style={{ ...styles.navBtn, ...(activeTab === "blog" ? styles.activeNavBtn : {}) }}>
              <BookOpen size={16} /> Blog & Office Docs
            </button>
          )}
          {hasAccess('routine') && (
            <button onClick={() => setActiveTab("routine")} style={{ ...styles.navBtn, ...(activeTab === "routine" ? styles.activeNavBtn : {}) }}>
              <CalendarIcon size={16} /> Dynamic Routine
            </button>
          )}
          {hasAccess('varsity') && (
            <button onClick={() => setActiveTab("varsity")} style={{ ...styles.navBtn, ...(activeTab === "varsity" ? styles.activeNavBtn : {}) }}>
              <GraduationCap size={16} /> Varsity Hub
            </button>
          )}
          {userSession.userRole === 'admin' && (
            <button onClick={() => setActiveTab("users")} style={{ ...styles.navBtn, ...(activeTab === "users" ? styles.adminNavBtn : {}) }}>
              <Users size={16} /> User Control
            </button>
          )}
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <main style={styles.mainContent}>
        {activeTab === "productivity" && hasAccess('habits') && (
          <div>
            <div style={styles.topWidgetsGrid}>
              <div style={styles.widgetCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', marginBottom: '8px' }}>
                  <Clock size={18} /> <strong>Live Server Clock</strong>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '2px', color: '#fff', margin: '10px 0' }}>
                  {currentTime.toLocaleTimeString()}
                </div>
                <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div style={styles.widgetCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ color: '#34d399' }}>⏱️ {timerMode}</strong>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => { setTimerRunning(false); setTimerMode("Focus (25m)"); setTimerSeconds(25 * 60); }} style={styles.miniBtn}>25m</button>
                    <button onClick={() => { setTimerRunning(false); setTimerMode("Short Break (5m)"); setTimerSeconds(5 * 60); }} style={styles.miniBtn}>5m</button>
                    <button onClick={() => { setTimerRunning(false); setTimerMode("Deep Work (50m)"); setTimerSeconds(50 * 60); }} style={styles.miniBtn}>50m</button>
                  </div>
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fbbf24', textAlign: 'center', margin: '8px 0' }}>
                  {formatTimer(timerSeconds)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button onClick={() => setTimerRunning(!timerRunning)} style={{ ...styles.addBtn, padding: '6px 14px', background: timerRunning ? '#f59e0b' : '#10b981' }}>
                    {timerRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
                  </button>
                  <button onClick={() => { setTimerRunning(false); setTimerSeconds(25 * 60); }} style={{ ...styles.miniBtn, padding: '6px 12px' }}>
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
              </div>

              {renderMiniCalendar()}
            </div>

            <div style={{ ...styles.cardBox, marginTop: '20px' }}>
              <h2>📋 To-Do Workflow (Pending • Processing • Completed)</h2>
              {canModify ? (
                <form onSubmit={addTask} style={styles.inlineForm}>
                  <input 
                    type="text" placeholder="Add a new task..." style={styles.formInput}
                    value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  />
                  <select style={styles.formSelect} value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                    <option value="High">🔥 High Priority</option>
                    <option value="Medium">⚡ Medium Priority</option>
                    <option value="Low">🌱 Low Priority</option>
                  </select>
                  <select style={styles.formSelect} value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                    <option value="pending">⏳ Pending</option>
                    <option value="processing">⚙️ Processing</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                  <button type="submit" style={styles.addBtn}><Plus size={16} /> Add Task</button>
                </form>
              ) : (
                <div style={styles.viewOnlyBanner}>🔒 View-Only Mode: Only Admin/Editors can modify tasks.</div>
              )}

              <div style={styles.kanbanGrid}>
                {[
                  { key: 'pending', label: '⏳ Pending', color: '#f59e0b' },
                  { key: 'processing', label: '⚙️ Processing', color: '#3b82f6' },
                  { key: 'completed', label: '✅ Completed', color: '#10b981' }
                ].map(col => (
                  <div key={col.key} style={styles.kanbanCol}>
                    <div style={{ ...styles.kanbanHeader, borderBottomColor: col.color }}>
                      <span>{col.label}</span>
                      <span style={styles.priorityBadge}>
                        {workspace.tasks.filter(t => t.status === col.key).length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                      {workspace.tasks.filter(t => t.status === col.key).map(task => (
                        <div key={task.id} style={styles.kanbanCard}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <strong style={{ fontSize: '14px', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                              {task.title}
                            </strong>
                            {canModify && (
                              <button onClick={() => deleteTask(task.id)} style={styles.deleteBtn}><Trash2 size={14} /></button>
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span style={styles.priorityBadge}>{task.priority}</span>
                            {canModify && (
                              <select 
                                value={task.status} 
                                onChange={e => changeTaskStatus(task.id, e.target.value)}
                                style={{ ...styles.formSelect, padding: '2px 6px', fontSize: '11px' }}
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                              </select>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...styles.cardBox, marginTop: '20px' }}>
              <h2>📊 Daily Habit Matrix & Weekly Tracker</h2>
              {canModify && (
                <form onSubmit={addHabit} style={styles.inlineForm}>
                  <input 
                    type="text" placeholder="New Habit Name (e.g. Solve 5 Math Problems)..." style={styles.formInput}
                    value={newHabitName} onChange={e => setNewHabitName(e.target.value)}
                  />
                  <button type="submit" style={styles.addBtn}><Plus size={16} /> Add Habit</button>
                </form>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={styles.matrixTable}>
                  <thead>
                    <tr>
                      <th style={styles.matrixTh}>Habit Name</th>
                      {HABIT_DAYS.map(d => <th key={d} style={styles.matrixTh}>{d}</th>)}
                      <th style={styles.matrixTh}>Progress</th>
                      {canModify && <th style={styles.matrixTh}>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {workspace.habits.map(h => {
                      const completedCount = h.days.filter(Boolean).length;
                      const pct = Math.round((completedCount / 7) * 100);
                      return (
                        <tr key={h.id}>
                          <td style={styles.matrixTd}><strong>{h.name}</strong></td>
                          {h.days.map((done, idx) => (
                            <td key={idx} style={{ ...styles.matrixTd, textAlign: 'center' }}>
                              <input 
                                type="checkbox" checked={done} disabled={!canModify}
                                onChange={() => toggleHabitDay(h.id, idx)}
                                style={{ width: '18px', height: '18px', cursor: canModify ? 'pointer' : 'not-allowed', accentColor: '#10b981' }}
                              />
                            </td>
                          ))}
                          <td style={styles.matrixTd}>
                            <div style={styles.progressBg}>
                              <div style={{ ...styles.progressFill, width: `${pct}%` }}></div>
                            </div>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{pct}% ({completedCount}/7)</span>
                          </td>
                          {canModify && (
                            <td style={{ ...styles.matrixTd, textAlign: 'center' }}>
                              <button onClick={() => deleteHabit(h.id)} style={styles.deleteBtn}><Trash2 size={15} /></button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "blog" && hasAccess('blog') && (
          <div style={styles.cardBox}>
            <h2>📖 Blog, Built-in Word Editor & MS Office Document Hub</h2>
            <p style={styles.subText}>
              Upload MS Office files (Word <code>.docx</code>, PDF <code>.pdf</code>, PowerPoint <code>.pptx</code>, Excel <code>.xlsx</code>), edit Word documents directly here, read PDFs in-browser, and share anywhere!
            </p>

            {canModify ? (
              <form onSubmit={saveBlogDocument} style={styles.stackForm}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input 
                    type="text" placeholder="Document / Blog Title..." style={{ ...styles.formInput, flex: 2 }}
                    value={newBlog.title} onChange={e => setNewBlog({ ...newBlog, title: e.target.value })} required
                  />
                  <select 
                    style={{ ...styles.formSelect, flex: 1 }}
                    value={newBlog.category} onChange={e => setNewBlog({ ...newBlog, category: e.target.value })}
                  >
                    <option value="MS Word / Note">📝 MS Word / Editable Doc</option>
                    <option value="PDF Document">📕 PDF Document</option>
                    <option value="PowerPoint Slide">📊 PowerPoint (.pptx)</option>
                    <option value="Excel Sheet">📗 Excel Spreadsheet (.xlsx)</option>
                  </select>
                </div>

                <div style={styles.wordToolbar}>
                  <span style={{ fontSize: '12px', color: '#9ca3af', marginRight: '8px' }}>Word Editor Tools:</span>
                  <button type="button" onClick={() => setNewBlog({ ...newBlog, content: newBlog.content + "\n# Heading\n" })} style={styles.miniBtn}>H1</button>
                  <button type="button" onClick={() => setNewBlog({ ...newBlog, content: newBlog.content + " **Bold Text** " })} style={styles.miniBtn}><b>B</b></button>
                  <button type="button" onClick={() => setNewBlog({ ...newBlog, content: newBlog.content + "\n• List Item" })} style={styles.miniBtn}>• Bullet</button>
                  <label style={{ ...styles.miniBtn, background: '#1e3a8a', color: '#93c5fd', cursor: 'pointer', marginLeft: 'auto' }}>
                    📎 Attach Office File (.pdf, .docx, .pptx, .xlsx)
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" 
                      style={{ display: 'none' }}
                      onChange={e => handleFileUpload(e, fileInfo => setNewBlog({ ...newBlog, ...fileInfo }))}
                    />
                  </label>
                </div>

                {newBlog.fileName && (
                  <div style={{ fontSize: '12px', color: '#34d399', padding: '4px 8px', background: '#064e3b', borderRadius: '4px' }}>
                    ✅ Attached File: <strong>{newBlog.fileName}</strong>
                  </div>
                )}

                <textarea 
                  placeholder="Type or edit your Word document / article content here..." 
                  style={{ ...styles.textarea, minHeight: '140px' }}
                  value={newBlog.content}
                  onChange={e => setNewBlog({ ...newBlog, content: e.target.value })}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={styles.addBtn}>
                    <Plus size={16} /> {editingBlogId ? "Update Word Doc / File" : "Save to Office Hub"}
                  </button>
                  {editingBlogId && (
                    <button type="button" onClick={() => { setEditingBlogId(null); setNewBlog({ title: "", category: "MS Word / Note", content: "", fileName: "", fileType: "", fileData: "" }); }} style={styles.miniBtn}>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div style={styles.viewOnlyBanner}>🔒 View-Only Mode: You can read PDFs, download Office files, and share posts.</div>
            )}

            <div style={styles.listContainer}>
              {workspace.blogs.map(blog => (
                <div key={blog.id} style={styles.blogCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span style={styles.priorityBadge}>{blog.category}</span>
                      <h3 style={{ margin: '6px 0', color: '#60a5fa' }}>{blog.title}</h3>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>📅 {blog.date}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => setPreviewDoc(blog)} style={{ ...styles.miniBtn, background: '#2563eb', color: '#fff' }}>
                        <Eye size={14} /> Read / View
                      </button>

                      {canModify && (
                        <button onClick={() => startEditBlog(blog)} style={{ ...styles.miniBtn, background: '#059669', color: '#fff' }}>
                          <Edit3 size={14} /> Edit Doc
                        </button>
                      )}

                      {blog.fileData && (
                        <a href={blog.fileData} download={blog.fileName || "document"} style={{ ...styles.miniBtn, background: '#4f46e5', color: '#fff', textDecoration: 'none' }}>
                          <Download size={14} /> Download ({blog.fileName})
                        </a>
                      )}

                      <button onClick={() => handleShareItem(blog.title, blog.content)} style={{ ...styles.miniBtn, background: '#0d9488', color: '#fff' }}>
                        <Share2 size={14} /> Share
                      </button>

                      {canModify && (
                        <button onClick={() => deleteBlog(blog.id)} style={styles.deleteBtn}><Trash2 size={16} /></button>
                      )}
                    </div>
                  </div>

                  <p style={{ margin: '8px 0 0 0', color: '#e5e7eb', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {blog.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "routine" && hasAccess('routine') && (
          <div style={styles.cardBox}>
            <h2>📅 Dynamic Routine Builder & Interactive Timetable</h2>
            <p style={styles.subText}>Create, filter, and organize your dynamic weekly schedule with start/end times, rooms, and instructors.</p>

            {canModify ? (
              <form onSubmit={addRoutineSlot} style={styles.inlineForm}>
                <select style={styles.formSelect} value={newRoutine.day} onChange={e => setNewRoutine({ ...newRoutine, day: e.target.value })}>
                  {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="time" style={{ ...styles.formInput, maxWidth: '120px' }} value={newRoutine.startTime} onChange={e => setNewRoutine({ ...newRoutine, startTime: e.target.value })} required />
                <input type="time" style={{ ...styles.formInput, maxWidth: '120px' }} value={newRoutine.endTime} onChange={e => setNewRoutine({ ...newRoutine, endTime: e.target.value })} required />
                <input type="text" placeholder="Course / Activity Name..." style={styles.formInput} value={newRoutine.subject} onChange={e => setNewRoutine({ ...newRoutine, subject: e.target.value })} required />
                <input type="text" placeholder="Room / Location" style={{ ...styles.formInput, maxWidth: '140px' }} value={newRoutine.room} onChange={e => setNewRoutine({ ...newRoutine, room: e.target.value })} />
                <input type="text" placeholder="Instructor / Note" style={{ ...styles.formInput, maxWidth: '150px' }} value={newRoutine.instructor} onChange={e => setNewRoutine({ ...newRoutine, instructor: e.target.value })} />
                <button type="submit" style={styles.addBtn}><Plus size={16} /> Add Slot</button>
              </form>
            ) : (
              <div style={styles.viewOnlyBanner}>🔒 View-Only Mode: Schedule is managed by Admin/Editors.</div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {["All", ...DAYS_OF_WEEK].map(day => (
                <button 
                  key={day} 
                  onClick={() => setSelectedRoutineDay(day)}
                  style={{ ...styles.navBtn, ...(selectedRoutineDay === day ? styles.activeNavBtn : {}) }}
                >
                  {day}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {DAYS_OF_WEEK.filter(d => selectedRoutineDay === "All" || selectedRoutineDay === d).map(day => {
                const slots = workspace.routines
                  .filter(r => r.day === day)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                if (slots.length === 0 && selectedRoutineDay === "All") return null;

                return (
                  <div key={day} style={{ background: '#1f2937', padding: '16px', borderRadius: '10px', border: '1px solid #374151' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#34d399', fontSize: '16px' }}>📌 {day}</h3>
                    {slots.length === 0 ? (
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>No classes or activities scheduled for {day}.</div>
                    ) : (
                      <div style={styles.routineCardsGrid}>
                        {slots.map(slot => (
                          <div key={slot.id} style={styles.routineSlotCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '13px' }}>
                                ⏰ {slot.startTime} - {slot.endTime}
                              </span>
                              {canModify && (
                                <button onClick={() => deleteRoutineSlot(slot.id)} style={styles.deleteBtn}><Trash2 size={14} /></button>
                              )}
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff', margin: '6px 0' }}>{slot.subject}</div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                              <span>📍 {slot.room || "TBA"}</span>
                              <span>👨‍🏫 {slot.instructor || "Self"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "varsity" && hasAccess('varsity') && (
          <div style={styles.varsitySplitLayout}>
            <div style={styles.cardBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <h2 style={{ margin: 0 }}>🎓 Varsity Academic Hub</h2>
                  <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '13px' }}>
                    Course-organized PDF/Word/PPTX materials, notices, and instant sharing.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setVarsitySubTab("materials")} 
                    style={{ ...styles.navBtn, ...(varsitySubTab === "materials" ? styles.activeNavBtn : {}) }}
                  >
                    <FolderOpen size={16} /> Course Materials ({workspace.varsityMaterials.length})
                  </button>
                  <button 
                    onClick={() => setVarsitySubTab("notices")} 
                    style={{ ...styles.navBtn, ...(varsitySubTab === "notices" ? styles.activeNavBtn : {}) }}
                  >
                    <Bell size={16} /> Notice Board ({workspace.varsityNotices.length})
                  </button>
                </div>
              </div>

              {!canModify && (
                <div style={styles.viewOnlyBanner}>
                  👁️ <strong>Viewer Access Active:</strong> You can view all notices, read PDFs in-browser, download course files, and share materials anywhere!
                </div>
              )}

              {varsitySubTab === "materials" && (
                <div>
                  {canModify && (
                    <form onSubmit={addVarsityMaterial} style={{ ...styles.stackForm, background: '#1f2937', padding: '15px', borderRadius: '8px' }}>
                      <strong style={{ color: '#60a5fa' }}>+ Upload Course Material (PDF, Word, PPTX)</strong>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input 
                          type="text" placeholder="Course Code & Title (e.g. CSE-201: Data Structures)" 
                          style={{ ...styles.formInput, flex: 1 }}
                          value={newMaterial.course} onChange={e => setNewMaterial({ ...newMaterial, course: e.target.value })} required
                        />
                        <input 
                          type="text" placeholder="Material Title (e.g. Lecture 3 Slides)" 
                          style={{ ...styles.formInput, flex: 1 }}
                          value={newMaterial.title} onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })} required
                        />
                      </div>
                      <input 
                        type="text" placeholder="Short description or topic summary..." 
                        style={styles.formInput}
                        value={newMaterial.description} onChange={e => setNewMaterial({ ...newMaterial, description: e.target.value })}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <label style={{ ...styles.miniBtn, background: '#1e3a8a', color: '#93c5fd', cursor: 'pointer', padding: '8px 12px' }}>
                          📎 Choose File (PDF / DOCX / PPTX)
                          <input 
                            type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" style={{ display: 'none' }}
                            onChange={e => handleFileUpload(e, info => setNewMaterial({ ...newMaterial, ...info }))}
                          />
                        </label>
                        {newMaterial.fileName && <span style={{ color: '#34d399', fontSize: '12px' }}>Attached: {newMaterial.fileName}</span>}
                        <button type="submit" style={styles.addBtn}><Plus size={16} /> Add Material</button>
                      </div>
                    </form>
                  )}

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {uniqueCourses.map(c => (
                      <button 
                        key={c} 
                        onClick={() => setSelectedCourseFilter(c)}
                        style={{ ...styles.miniBtn, padding: '6px 12px', background: selectedCourseFilter === c ? '#2563eb' : '#1f2937', color: '#fff' }}
                      >
                        📁 {c}
                      </button>
                    ))}
                  </div>

                  {uniqueCourses.filter(c => c !== "All Courses" && (selectedCourseFilter === "All Courses" || selectedCourseFilter === c)).map(courseName => {
                    const courseItems = workspace.varsityMaterials.filter(m => m.course === courseName);
                    return (
                      <div key={courseName} style={styles.courseFolderBox}>
                        <div style={styles.courseFolderHeader}>
                          <strong>📚 {courseName}</strong>
                          <span style={styles.priorityBadge}>{courseItems.length} files</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                          {courseItems.map(mat => (
                            <div key={mat.id} style={styles.listItem}>
                              <div>
                                <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '15px' }}>{mat.title}</div>
                                <div style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0' }}>{mat.description}</div>
                                <div style={{ fontSize: '11px', color: '#60a5fa' }}>
                                  📄 {mat.fileName || "No file attached"} • 📅 {mat.date}
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <button 
                                  onClick={() => setPreviewDoc({ title: mat.title, category: mat.course, content: mat.description, fileName: mat.fileName, fileType: mat.fileType, fileData: mat.fileData })}
                                  style={{ ...styles.miniBtn, background: '#2563eb', color: '#fff' }}
                                >
                                  <Eye size={14} /> View / Read PDF
                                </button>

                                {mat.fileData && (
                                  <a 
                                    href={mat.fileData} 
                                    download={mat.fileName || "material"} 
                                    style={{ ...styles.miniBtn, background: '#059669', color: '#fff', textDecoration: 'none' }}
                                  >
                                    <Download size={14} /> Download
                                  </a>
                                )}

                                <button 
                                  onClick={() => handleShareItem(`${mat.course} - ${mat.title}`, mat.description)}
                                  style={{ ...styles.miniBtn, background: '#0d9488', color: '#fff' }}
                                >
                                  <Share2 size={14} /> Share
                                </button>

                                {canModify && (
                                  <button onClick={() => deleteVarsityMaterial(mat.id)} style={styles.deleteBtn}><Trash2 size={15} /></button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {varsitySubTab === "notices" && (
                <div>
                  {canModify && (
                    <form onSubmit={addVarsityNotice} style={{ ...styles.stackForm, background: '#1f2937', padding: '15px', borderRadius: '8px' }}>
                      <strong style={{ color: '#fbbf24' }}>📢 Post Official Notice</strong>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          type="text" placeholder="Notice Title..." style={{ ...styles.formInput, flex: 2 }}
                          value={newNotice.title} onChange={e => setNewNotice({ ...newNotice, title: e.target.value })} required
                        />
                        <input 
                          type="text" placeholder="Course (e.g. CSE-201 or All)" style={{ ...styles.formInput, flex: 1 }}
                          value={newNotice.course} onChange={e => setNewNotice({ ...newNotice, course: e.target.value })} required
                        />
                      </div>
                      <textarea 
                        placeholder="Notice details..." style={styles.textarea}
                        value={newNotice.content} onChange={e => setNewNotice({ ...newNotice, content: e.target.value })} required
                      />
                      <button type="submit" style={styles.addBtn}><Plus size={16} /> Publish Notice</button>
                    </form>
                  )}

                  <div style={styles.listContainer}>
                    {workspace.varsityNotices.map(n => (
                      <div key={n.id} style={styles.blogCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={styles.priorityBadge}>{n.course}</span>
                            <h3 style={{ margin: '6px 0', color: '#fbbf24' }}>📢 {n.title}</h3>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleShareItem(n.title, n.content)} style={{ ...styles.miniBtn, background: '#0d9488', color: '#fff' }}>
                              <Share2 size={14} /> Share
                            </button>
                            {canModify && (
                              <button onClick={() => deleteVarsityNotice(n.id)} style={styles.deleteBtn}><Trash2 size={15} /></button>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>📅 Posted: {n.date}</div>
                        <p style={{ margin: 0, color: '#e5e7eb' }}>{n.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={styles.examSidebarCard}>
              <h3 style={{ margin: '0 0 6px 0', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🗓️ Automatic Exam Calendar
              </h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: 0, marginBottom: '15px' }}>
                Auto-sorted chronological exam schedule & syllabus tracker.
              </p>

              {canModify && (
                <form onSubmit={addVarsityExam} style={{ ...styles.stackForm, background: '#1f2937', padding: '12px', borderRadius: '8px', marginBottom: '18px' }}>
                  <strong style={{ fontSize: '13px', color: '#60a5fa' }}>+ Schedule New Exam</strong>
                  <input 
                    type="text" placeholder="Course Name (e.g. CSE-201)" style={styles.formInput}
                    value={newExam.course} onChange={e => setNewExam({ ...newExam, course: e.target.value })} required
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select style={{ ...styles.formSelect, flex: 1 }} value={newExam.examType} onChange={e => setNewExam({ ...newExam, examType: e.target.value })}>
                      <option value="Midterm">Midterm</option>
                      <option value="Final">Final</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Lab Viva">Lab Viva</option>
                    </select>
                    <input type="date" style={{ ...styles.formInput, flex: 1 }} value={newExam.date} onChange={e => setNewExam({ ...newExam, date: e.target.value })} required />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="text" placeholder="Time (10:00 AM)" style={{ ...styles.formInput, flex: 1 }} value={newExam.time} onChange={e => setNewExam({ ...newExam, time: e.target.value })} />
                    <input type="text" placeholder="Room (e.g. 402)" style={{ ...styles.formInput, flex: 1 }} value={newExam.room} onChange={e => setNewExam({ ...newExam, room: e.target.value })} />
                  </div>
                  <input type="text" placeholder="Syllabus / Topics..." style={styles.formInput} value={newExam.syllabus} onChange={e => setNewExam({ ...newExam, syllabus: e.target.value })} />
                  <button type="submit" style={{ ...styles.addBtn, justifyContent: 'center' }}><Plus size={15} /> Add to Exam Calendar</button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedExams.map(ex => {
                  const daysLeft = Math.ceil((new Date(ex.date) - new Date()) / (1000 * 60 * 60 * 24));
                  const examDateObj = new Date(ex.date);
                  const monthStr = examDateObj.toLocaleString('default', { month: 'short' });
                  const dayNum = examDateObj.getDate();

                  return (
                    <div key={ex.id} style={styles.examCalItem}>
                      <div style={styles.examDateBadge}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#fca5a5' }}>{monthStr}</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{isNaN(dayNum) ? "--" : dayNum}</div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', background: '#7f1d1d', color: '#fecaca', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                            {ex.examType}
                          </span>
                          <span style={{ fontSize: '11px', color: daysLeft >= 0 ? '#34d399' : '#9ca3af' }}>
                            {daysLeft > 0 ? `⏳ ${daysLeft} days left` : daysLeft === 0 ? "🔥 Today!" : "✅ Completed"}
                          </span>
                        </div>
                        <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px', marginTop: '4px' }}>{ex.course}</div>
                        <div style={{ fontSize: '12px', color: '#fbbf24', marginTop: '2px' }}>⏰ {ex.time} • 📍 {ex.room}</div>
                        {ex.syllabus && (
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>📖 Syllabus: {ex.syllabus}</div>
                        )}
                      </div>

                      {canModify && (
                        <button onClick={() => deleteVarsityExam(ex.id)} style={styles.deleteBtn}><Trash2 size={14} /></button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && userSession.userRole === 'admin' && (
          <div style={styles.cardBox}>
            <h2>🛡️ Admin Access Control Center (Student & User Manager)</h2>
            <p style={styles.subText}>Create student accounts as Viewers (or Editors) and control exactly which tabs they can see.</p>
            {adminMsg && <div style={styles.successBanner}>{adminMsg}</div>}

            <form onSubmit={handleCreateUser} style={{ ...styles.inlineForm, background: '#1f2937', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
              <input type="text" placeholder="Student Username (e.g. student1)" required style={styles.formInput} value={newUserForm.username} onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })} />
              <input type="password" placeholder="Password" required style={styles.formInput} value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} />
              <input type="text" placeholder="Allowed Tabs (varsity,routine,blog)" required style={styles.formInput} value={newUserForm.permissions} onChange={e => setNewUserForm({ ...newUserForm, permissions: e.target.value })} />
              <select style={styles.formSelect} value={newUserForm.access_type} onChange={e => setNewUserForm({ ...newUserForm, access_type: e.target.value })}>
                <option value="view">👁️ Viewer (Read/Download/Share Only)</option>
                <option value="edit">✏️ Editor (Can Modify)</option>
              </select>
              <button type="submit" style={styles.addBtn}><Plus size={16} /> Add Student / User</button>
            </form>

            <div style={styles.listContainer}>
              {userList.map(u => (
                <div key={u.id} style={styles.listItem}>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '16px' }}>👤 {u.username}</strong>
                    <span style={{ marginLeft: '10px', color: '#9ca3af', fontSize: '13px' }}>Role: {u.role}</span>
                  </div>
                  {u.role === 'admin' ? (
                    <span style={styles.priorityBadge}>Full Master Admin</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{ fontSize: '12px', color: '#9ca3af' }}>Allowed Tabs:</label>
                      <input type="text" defaultValue={u.permissions} id={`perm-${u.username}`} style={{ ...styles.formInput, width: '180px', padding: '6px 10px' }} />
                      <select defaultValue={u.access_type} id={`access-${u.username}`} style={{ ...styles.formSelect, padding: '6px 10px' }}>
                        <option value="view">👁️ Viewer Only</option>
                        <option value="edit">✏️ Can Edit/Add</option>
                      </select>
                      <button 
                        onClick={() => {
                          const p = document.getElementById(`perm-${u.username}`).value;
                          const a = document.getElementById(`access-${u.username}`).value;
                          handleUpdateUser(u.username, p, a);
                        }}
                        style={{ ...styles.addBtn, padding: '6px 12px', background: '#2563eb' }}
                      >
                        Save Access
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {previewDoc && (
        <div style={styles.modalOverlay} onClick={() => setPreviewDoc(null)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', paddingBottom: '12px', marginBottom: '15px' }}>
              <div>
                <span style={styles.priorityBadge}>{previewDoc.category}</span>
                <h3 style={{ margin: '5px 0 0 0', color: '#60a5fa' }}>{previewDoc.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {previewDoc.fileData && (
                  <a href={previewDoc.fileData} download={previewDoc.fileName || "file"} style={{ ...styles.miniBtn, background: '#059669', color: '#fff', textDecoration: 'none' }}>
                    <Download size={14} /> Download File
                  </a>
                )}
                <button onClick={() => handleShareItem(previewDoc.title, previewDoc.content)} style={{ ...styles.miniBtn, background: '#0d9488', color: '#fff' }}>
                  <Share2 size={14} /> Share
                </button>
                <button onClick={() => setPreviewDoc(null)} style={{ ...styles.miniBtn, background: '#ef4444', color: '#fff' }}>✕ Close</button>
              </div>
            </div>

            {previewDoc.content && (
              <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#e5e7eb' }}>
                {previewDoc.content}
              </div>
            )}

            {previewDoc.fileData && (previewDoc.fileType?.includes('pdf') || previewDoc.fileName?.toLowerCase().endsWith('.pdf')) ? (
              <iframe 
                src={previewDoc.fileData} 
                title="Built-in PDF Reader"
                style={{ width: '100%', height: '500px', border: '1px solid #374151', borderRadius: '8px', background: '#fff' }}
              />
            ) : previewDoc.fileData ? (
              <div style={{ padding: '25px', textAlign: 'center', background: '#1f2937', borderRadius: '8px' }}>
                <FileText size={40} color="#60a5fa" />
                <p style={{ margin: '10px 0' }}>Attached MS Office File: <strong>{previewDoc.fileName}</strong></p>
                <a href={previewDoc.fileData} download={previewDoc.fileName} style={{ ...styles.addBtn, display: 'inline-flex', textDecoration: 'none' }}>
                  <Download size={16} /> Download & Open in MS Office
                </a>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loginContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#090d16', fontFamily: 'Segoe UI, sans-serif' },
  loginCard: { background: '#111827', padding: '40px', borderRadius: '16px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid #1f2937', color: '#fff', textAlign: 'center' },
  logoBox: { fontSize: '40px', marginBottom: '10px' },
  loginTitle: { fontSize: '22px', fontWeight: 'bold', marginBottom: '10px', letterSpacing: '1px' },
  errorBox: { background: '#7f1d1d', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' },
  form: { textAlign: 'left' },
  label: { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', marginBottom: '5px' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  loginBtn: { width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  dashboard: { minHeight: '100vh', background: '#090d16', color: '#fff', fontFamily: 'Segoe UI, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', background: '#111827', borderBottom: '1px solid #1f2937', flexWrap: 'wrap', gap: '10px' },
  brand: { fontWeight: 'bold', fontSize: '16px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '10px' },
  roleTag: { fontSize: '11px', background: '#1e3a8a', color: '#93c5fd', padding: '4px 8px', borderRadius: '6px' },
  nav: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  navBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'transparent', border: '1px solid #374151', color: '#9ca3af', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  activeNavBtn: { background: '#2563eb', color: '#fff', borderColor: '#2563eb' },
  adminNavBtn: { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  mainContent: { padding: '25px', maxWidth: '1280px', margin: '0 auto' },
  cardBox: { background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #1f2937' },
  subText: { color: '#9ca3af', fontSize: '13px', marginTop: '-8px', marginBottom: '20px' },
  topWidgetsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '18px' },
  widgetCard: { background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' },
  calGridHeader: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginBottom: '6px', fontWeight: 'bold' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' },
  calEmptyCell: { padding: '6px' },
  calDayCell: { padding: '6px', fontSize: '12px', borderRadius: '6px', background: '#1f2937', color: '#d1d5db' },
  calTodayCell: { background: '#2563eb', color: '#fff', fontWeight: 'bold' },
  kanbanGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '15px' },
  kanbanCol: { background: '#1f2937', padding: '14px', borderRadius: '10px', border: '1px solid #374151' },
  kanbanHeader: { display: 'flex', justifyContent: 'space-terminate', alignItems: 'center', paddingBottom: '8px', borderBottom: '2px solid #3b82f6', fontWeight: 'bold', fontSize: '14px' },
  kanbanCard: { background: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #374151' },
  matrixTable: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  matrixTh: { padding: '10px', borderBottom: '1px solid #374151', textAlign: 'left', fontSize: '12px', color: '#9ca3af' },
  matrixTd: { padding: '10px', borderBottom: '1px solid #1f2937', fontSize: '13px' },
  progressBg: { width: '100%', height: '6px', background: '#374151', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' },
  progressFill: { height: '100%', background: '#10b981' },
  wordToolbar: { display: 'flex', gap: '6px', alignItems: 'center', background: '#1f2937', padding: '8px 12px', borderRadius: '6px', border: '1px solid #374151', flexWrap: 'wrap' },
  routineCardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' },
  routineSlotCard: { background: '#111827', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' },
  varsitySplitLayout: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' },
  courseFolderBox: { background: '#1f2937', padding: '16px', borderRadius: '10px', border: '1px solid #374151', marginBottom: '16px' },
  courseFolderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #374151', color: '#60a5fa', fontSize: '15px' },
  examSidebarCard: { background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #7f1d1d', position: 'sticky', top: '20px' },
  examCalItem: { display: 'flex', gap: '12px', alignItems: 'center', background: '#1f2937', padding: '12px', borderRadius: '10px', border: '1px solid #374151' },
  examDateBadge: { background: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', minWidth: '48px' },
  inlineForm: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  stackForm: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  formInput: { padding: '10px 12px', background: '#111827', border: '1px solid #374151', borderRadius: '6px', color: '#fff', fontSize: '13px', flex: 1 },
  formSelect: { padding: '10px 12px', background: '#111827', border: '1px solid #374151', borderRadius: '6px', color: '#fff', fontSize: '13px' },
  textarea: { padding: '10px 12px', background: '#111827', border: '1px solid #374151', borderRadius: '6px', color: '#fff', fontSize: '13px', minHeight: '80px', fontFamily: 'inherit' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  miniBtn: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#374151', color: '#e5e7eb', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#111827', borderRadius: '8px', border: '1px solid #374151', flexWrap: 'wrap', gap: '10px' },
  blogCard: { padding: '16px', background: '#1f2937', borderRadius: '8px', border: '1px solid #374151' },
  priorityBadge: { fontSize: '11px', padding: '3px 8px', background: '#374151', color: '#d1d5db', borderRadius: '12px' },
  deleteBtn: { background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' },
  viewOnlyBanner: { padding: '12px 16px', background: '#1e293b', borderLeft: '4px solid #f59e0b', color: '#fcd34d', borderRadius: '6px', marginBottom: '20px', fontSize: '13px' },
  successBanner: { padding: '10px 15px', background: '#064e3b', color: '#6ee7b7', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
  modalBox: { background: '#111827', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #374151' }
};