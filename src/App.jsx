import React, { useState, useEffect } from 'react';

const DEFAULT_WORKSPACE = {
  pinnedNotice: '📢 Midterm examinations will start next Sunday! Please check the updated routine and course materials.',
  examCountdown: {
    title: 'Midterm Examination',
    date: '2026-11-20T09:00'
  },
  dailyMatrix: [
    { id: 1, activity: 'Attend Scheduled Lectures', category: 'Academic', target: '2 Classes', completed: true },
    { id: 2, activity: 'Review Lecture Slides & Notes', category: 'Self Study', target: '60 Mins', completed: true },
    { id: 3, activity: 'Practice Problem Solving / Coding', category: 'Skill', target: '45 Mins', completed: false },
    { id: 4, activity: 'Prepare Upcoming Assignment / Lab', category: 'Task', target: '1 Topic', completed: false }
  ],
  materials: [
    {
      id: 1,
      course: 'CSE-101',
      title: 'Introduction to Programming Lecture Slide',
      type: 'Slide',
      date: '2026-11-01',
      fileData: '',
      fileName: 'CSE101_Intro.pdf',
      externalUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 2,
      course: 'MAT-102',
      title: 'Linear Algebra & Matrix Determinant Notes',
      type: 'PDF',
      date: '2026-11-02',
      fileData: '',
      fileName: 'Linear_Algebra_Notes.pdf',
      externalUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ],
  routines: [
    { id: 1, day: 'Sunday', startTime: '09:00', endTime: '10:30', course: 'CSE-101', room: 'Room 402', teacher: 'Dr. Rahman' },
    { id: 2, day: 'Sunday', startTime: '11:00', endTime: '12:30', course: 'MAT-102', room: 'Room 305', teacher: 'Prof. Karim' },
    { id: 3, day: 'Monday', startTime: '10:00', endTime: '11:30', course: 'PHY-103', room: 'Lab 201', teacher: 'Mr. Hasan' },
    { id: 4, day: 'Tuesday', startTime: '09:00', endTime: '10:30', course: 'CSE-101', room: 'Room 402', teacher: 'Dr. Rahman' },
    { id: 5, day: 'Wednesday', startTime: '11:00', endTime: '12:30', course: 'ENG-101', room: 'Room 104', teacher: 'Ms. Nadia' },
    { id: 6, day: 'Thursday', startTime: '09:30', endTime: '11:00', course: 'MAT-102', room: 'Room 305', teacher: 'Prof. Karim' }
  ],
  blogs: [
    {
      id: 1,
      title: 'Midterm Examination Preparation Guidelines',
      author: 'Master Admin',
      date: '2026-11-02',
      content: 'All students are requested to review the lecture sheets thoroughly. If you have any doubts or questions, feel free to post them in the Q&A Forum.'
    }
  ],
  discussions: [
    {
      id: 1,
      author: 'B54SC',
      text: 'Sir, has the 2nd lecture sheet on Matrix Determinants been uploaded yet?',
      time: '10:30 AM',
      replies: [
        { id: 101, author: 'admin', text: 'Yes, just search for MAT-102 in the Materials section.', time: '10:45 AM' }
      ]
    }
  ]
};

// --- WEB AUDIO API BEEP-BEEP SOUND GENERATOR ---
const playBeepAlarm = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const beepTimes = [0, 0.25, 0.5, 0.85, 1.1, 1.35];

    beepTimes.forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime + offset); // 880Hz distinct digital beep
      gain.gain.setValueAtTime(0.25, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.18);
    });
  } catch (err) {
    console.error('Audio play failed:', err);
  }
};

export default function App() {
  // --- AUTHENTICATION STATE ---
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('varsity_portal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- NAVIGATION & WORKSPACE STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workspace, setWorkspace] = useState(DEFAULT_WORKSPACE);
  const [syncStatus, setSyncStatus] = useState('Synced ✅');

  // --- ADMIN USER MANAGEMENT STATE ---
  const [usersList, setUsersList] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newPermissions, setNewPermissions] = useState('varsity,routine,blog');
  const [newAccessType, setNewAccessType] = useState('view');

  // --- SMART FEATURES STATE ---
  const [timeLeft, setTimeLeft] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [previewItem, setPreviewItem] = useState(null);

  // Daily Activity Matrix Form State
  const [matrixTask, setMatrixTask] = useState('');
  const [matrixCategory, setMatrixCategory] = useState('Academic');
  const [matrixTarget, setMatrixTarget] = useState('60 Mins');

  // Material Form (Add & Edit)
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [matCourse, setMatCourse] = useState('');
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState('PDF');
  const [matUrl, setMatUrl] = useState('');
  const [matFile, setMatFile] = useState(null);

  // Routine Form (Add & Edit)
  const [editingRoutineId, setEditingRoutineId] = useState(null);
  const [rtDay, setRtDay] = useState('Sunday');
  const [rtStart, setRtStart] = useState('09:00');
  const [rtEnd, setRtEnd] = useState('10:30');
  const [rtCourse, setRtCourse] = useState('');
  const [rtRoom, setRtRoom] = useState('');
  const [rtTeacher, setRtTeacher] = useState('');

  // Blog Form (Add & Edit)
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');

  // Q&A Form
  const [questionText, setQuestionText] = useState('');
  const [replyTexts, setReplyTexts] = useState({});

  // --- CUSTOM POMODORO TIMER & INTERVAL STATE ---
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [totalIntervals, setTotalIntervals] = useState(4);
  const [currentInterval, setCurrentInterval] = useState(1);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);

  // Productivity Tools: To-Do, Attendance, CGPA
  const [todoList, setTodoList] = useState([
    { id: 1, text: 'Complete CSE-101 Assignment', done: false },
    { id: 2, text: 'Revise Matrix Determinant Notes', done: true }
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [attendedClasses, setAttendedClasses] = useState(18);
  const [totalClasses, setTotalClasses] = useState(22);
  const [cgpaCourses, setCgpaCourses] = useState([
    { name: 'Course 1', credit: 3, gpa: 3.75 },
    { name: 'Course 2', credit: 3, gpa: 4.00 },
    { name: 'Course 3', credit: 1.5, gpa: 3.50 }
  ]);

  const isAdmin = currentUser?.role === 'admin';
  const canEdit = isAdmin || currentUser?.access_type === 'edit';

  // --- FETCH INITIAL WORKSPACE & USERS ---
  useEffect(() => {
    fetchWorkspace();
    if (isAdmin) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchWorkspace = async () => {
    try {
      const res = await fetch('/api/workspace');
      const json = await res.json();
      if (json.success && json.data) {
        setWorkspace({
          ...DEFAULT_WORKSPACE,
          ...json.data,
          dailyMatrix: json.data.dailyMatrix || DEFAULT_WORKSPACE.dailyMatrix
        });
      }
    } catch (err) {
      console.error('Failed to load workspace:', err);
    }
  };

  const saveWorkspace = async (updatedData) => {
    setWorkspace(updatedData);
    setSyncStatus('Saving... ⏳');
    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedData })
      });
      const json = await res.json();
      if (json.success) setSyncStatus('Synced ✅');
      else setSyncStatus('Save Failed ❌');
    } catch (err) {
      setSyncStatus('Offline (Saved Locally) ⚠️');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (json.success) setUsersList(json.users);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  // --- LIVE CLOCK & EXAM COUNTDOWN ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const targetDate = new Date(workspace.examCountdown?.date || '2026-11-20T09:00');
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft('🎉 Exam Started / Completed!');
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${String(d).padStart(2, '0')}d : ${String(h).padStart(2, '0')}h : ${String(m).padStart(2, '0')}m : ${String(s).padStart(2, '0')}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [workspace.examCountdown]);

  // --- CUSTOM POMODORO TIMER WITH INTERVALS & BEEP-BEEP SOUND ---
  useEffect(() => {
    let interval = null;
    if (pomoRunning && pomoSeconds > 0) {
      interval = setInterval(() => setPomoSeconds((s) => s - 1), 1000);
    } else if (pomoRunning && pomoSeconds === 0) {
      playBeepAlarm();

      if (!isBreakMode) {
        // Focus finished -> check if more intervals remain or switch to Break
        if (currentInterval < totalIntervals) {
          setIsBreakMode(true);
          setPomoSeconds(Math.max(1, Number(breakMinutes)) * 60);
          alert(`🔔 Beep-Beep! Focus Round ${currentInterval}/${totalIntervals} complete! Starting a ${breakMinutes}-minute break.`);
        } else {
          setPomoRunning(false);
          setCurrentInterval(1);
          setIsBreakMode(false);
          setPomoSeconds(Math.max(1, Number(focusMinutes)) * 60);
          alert(`🎉 Beep-Beep! Congratulations! All ${totalIntervals} Focus Intervals are completed!`);
        }
      } else {
        // Break finished -> start next Focus interval
        const nextRound = currentInterval + 1;
        setCurrentInterval(nextRound);
        setIsBreakMode(false);
        setPomoSeconds(Math.max(1, Number(focusMinutes)) * 60);
        alert(`🔔 Beep-Beep! Break is over! Starting Focus Round ${nextRound}/${totalIntervals}.`);
      }
    }
    return () => clearInterval(interval);
  }, [pomoRunning, pomoSeconds, isBreakMode, currentInterval, totalIntervals, focusMinutes, breakMinutes]);

  const applyCustomPomodoroSettings = (e) => {
    e.preventDefault();
    const validFocus = Math.max(1, Number(focusMinutes) || 25);
    const validBreak = Math.max(1, Number(breakMinutes) || 5);
    const validIntervals = Math.max(1, Number(totalIntervals) || 4);
    setFocusMinutes(validFocus);
    setBreakMinutes(validBreak);
    setTotalIntervals(validIntervals);
    setPomoRunning(false);
    setIsBreakMode(false);
    setCurrentInterval(1);
    setPomoSeconds(validFocus * 60);
  };

  // --- LOGIN / LOGOUT HANDLERS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('varsity_portal_user', JSON.stringify(data.user));
      } else {
        setLoginError(data.error || 'Invalid username or password!');
      }
    } catch (err) {
      setLoginError('Unable to connect to the server!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('varsity_portal_user');
    setLoginUsername('');
    setLoginPassword('');
  };

  // --- SMART ROUTINE: "NOW & UP NEXT" CALCULATOR ---
  const getLiveClassStatus = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[currentTime.getDay()];
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    const todaysClasses = (workspace.routines || [])
      .filter((r) => r.day.toLowerCase() === todayName.toLowerCase())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    let ongoingClass = null;
    let nextClass = null;

    for (const cls of todaysClasses) {
      const [sh, sm] = cls.startTime.split(':').map(Number);
      const [eh, em] = cls.endTime.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;

      if (nowMinutes >= startMin && nowMinutes <= endMin) {
        ongoingClass = cls;
      } else if (nowMinutes < startMin && !nextClass) {
        nextClass = cls;
      }
    }

    return { todayName, ongoingClass, nextClass, todaysClasses };
  };

  const { todayName, ongoingClass, nextClass, todaysClasses } = getLiveClassStatus();

  // --- WHATSAPP SHARE ---
  const shareToWhatsApp = (title, details = '') => {
    const message = `📚 *Varsity Portal Alert*\n📌 *${title}*\n${details}\n🔗 Portal Link: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- DAILY ACTIVITY MATRIX HANDLERS ---
  const toggleMatrixItem = (id) => {
    const updated = (workspace.dailyMatrix || []).map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveWorkspace({ ...workspace, dailyMatrix: updated });
  };

  const handleAddMatrixItem = (e) => {
    e.preventDefault();
    if (!matrixTask.trim()) return;
    const newItem = {
      id: Date.now(),
      activity: matrixTask.trim(),
      category: matrixCategory,
      target: matrixTarget.trim() || 'Daily',
      completed: false
    };
    saveWorkspace({ ...workspace, dailyMatrix: [...(workspace.dailyMatrix || []), newItem] });
    setMatrixTask('');
  };

  const handleDeleteMatrixItem = (id) => {
    const updated = (workspace.dailyMatrix || []).filter((item) => item.id !== id);
    saveWorkspace({ ...workspace, dailyMatrix: updated });
  };

  // --- MATERIAL UPLOAD, EDIT & DELETE ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMatFile({ name: file.name, data: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMaterial = (e) => {
    e.preventDefault();
    if (!matCourse.trim() || !matTitle.trim()) return;

    if (editingMaterialId) {
      const updatedMaterials = (workspace.materials || []).map((m) => {
        if (m.id === editingMaterialId) {
          return {
            ...m,
            course: matCourse.trim().toUpperCase(),
            title: matTitle.trim(),
            type: matType,
            externalUrl: matUrl.trim(),
            fileName: matFile ? matFile.name : m.fileName,
            fileData: matFile ? matFile.data : m.fileData
          };
        }
        return m;
      });
      saveWorkspace({ ...workspace, materials: updatedMaterials });
      setEditingMaterialId(null);
    } else {
      const newMat = {
        id: Date.now(),
        course: matCourse.trim().toUpperCase(),
        title: matTitle.trim(),
        type: matType,
        date: new Date().toISOString().slice(0, 10),
        fileName: matFile ? matFile.name : '',
        fileData: matFile ? matFile.data : '',
        externalUrl: matUrl.trim()
      };
      saveWorkspace({ ...workspace, materials: [newMat, ...(workspace.materials || [])] });
    }

    setMatCourse('');
    setMatTitle('');
    setMatType('PDF');
    setMatUrl('');
    setMatFile(null);
  };

  const startEditMaterial = (item) => {
    setEditingMaterialId(item.id);
    setMatCourse(item.course);
    setMatTitle(item.title);
    setMatType(item.type);
    setMatUrl(item.externalUrl || '');
    setMatFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMaterial = (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    saveWorkspace({
      ...workspace,
      materials: workspace.materials.filter((m) => m.id !== id)
    });
  };

  // --- ROUTINE ADD, EDIT & DELETE ---
  const handleSaveRoutine = (e) => {
    e.preventDefault();
    if (!rtCourse.trim()) return;

    if (editingRoutineId) {
      const updatedRoutines = (workspace.routines || []).map((r) => {
        if (r.id === editingRoutineId) {
          return {
            ...r,
            day: rtDay,
            startTime: rtStart,
            endTime: rtEnd,
            course: rtCourse.trim().toUpperCase(),
            room: rtRoom.trim() || 'TBA',
            teacher: rtTeacher.trim() || 'Faculty'
          };
        }
        return r;
      });
      saveWorkspace({ ...workspace, routines: updatedRoutines });
      setEditingRoutineId(null);
    } else {
      const newRt = {
        id: Date.now(),
        day: rtDay,
        startTime: rtStart,
        endTime: rtEnd,
        course: rtCourse.trim().toUpperCase(),
        room: rtRoom.trim() || 'TBA',
        teacher: rtTeacher.trim() || 'Faculty'
      };
      saveWorkspace({ ...workspace, routines: [...(workspace.routines || []), newRt] });
    }

    setRtCourse('');
    setRtRoom('');
    setRtTeacher('');
  };

  const startEditRoutine = (r) => {
    setEditingRoutineId(r.id);
    setRtDay(r.day);
    setRtStart(r.startTime);
    setRtEnd(r.endTime);
    setRtCourse(r.course);
    setRtRoom(r.room);
    setRtTeacher(r.teacher);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRoutine = (id) => {
    if (!window.confirm('Delete this class slot from the routine?')) return;
    saveWorkspace({
      ...workspace,
      routines: workspace.routines.filter((r) => r.id !== id)
    });
  };

  // --- Q&A DISCUSSION HANDLERS ---
  const handleAddQuestion = () => {
    if (!questionText.trim()) return;
    const newPost = {
      id: Date.now(),
      author: currentUser.username,
      text: questionText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replies: []
    };
    saveWorkspace({ ...workspace, discussions: [newPost, ...(workspace.discussions || [])] });
    setQuestionText('');
  };

  const handleAddReply = (postId) => {
    const replyText = replyTexts[postId];
    if (!replyText || !replyText.trim()) return;
    const updatedDiscussions = (workspace.discussions || []).map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [
            ...(post.replies || []),
            {
              id: Date.now(),
              author: currentUser.username,
              text: replyText.trim(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return post;
    });
    saveWorkspace({ ...workspace, discussions: updatedDiscussions });
    setReplyTexts({ ...replyTexts, [postId]: '' });
  };

  const handleDeleteQuestion = (postId) => {
    if (!window.confirm('Delete this discussion thread?')) return;
    saveWorkspace({
      ...workspace,
      discussions: (workspace.discussions || []).filter((p) => p.id !== postId)
    });
  };

  // --- BLOG ADD, EDIT & DELETE ---
  const handleSaveBlog = (e) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogContent.trim()) return;

    if (editingBlogId) {
      const updatedBlogs = (workspace.blogs || []).map((b) => {
        if (b.id === editingBlogId) {
          return { ...b, title: blogTitle.trim(), content: blogContent.trim() };
        }
        return b;
      });
      saveWorkspace({ ...workspace, blogs: updatedBlogs });
      setEditingBlogId(null);
    } else {
      const newPost = {
        id: Date.now(),
        title: blogTitle.trim(),
        author: currentUser.name || currentUser.username,
        date: new Date().toISOString().slice(0, 10),
        content: blogContent.trim()
      };
      saveWorkspace({ ...workspace, blogs: [newPost, ...(workspace.blogs || [])] });
    }

    setBlogTitle('');
    setBlogContent('');
  };

  const startEditBlog = (b) => {
    setEditingBlogId(b.id);
    setBlogTitle(b.title);
    setBlogContent(b.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBlog = (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    saveWorkspace({
      ...workspace,
      blogs: (workspace.blogs || []).filter((b) => b.id !== id)
    });
  };

  // --- ADMIN USER MANAGEMENT HANDLERS ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;
    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername.trim(),
        password: newPassword,
        name: newName.trim() || newUsername.trim(),
        permissions: newPermissions,
        access_type: newAccessType
      })
    });
    const data = await res.json();
    if (data.success) {
      alert('✅ New user account created successfully!');
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      fetchUsers();
    } else {
      alert(data.error || 'Failed to create user!');
    }
  };

  const handleUpdateUserAccess = async (username, permissions, access_type) => {
    const res = await fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, permissions, access_type })
    });
    const data = await res.json();
    if (data.success) {
      fetchUsers();
    } else {
      alert('Failed to update user permissions!');
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${username}"?`)) return;
    const res = await fetch(`/api/users/${username}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchUsers();
    } else {
      alert(data.error || 'Failed to delete user!');
    }
  };

  const handleResetUserPassword = async (username) => {
    const newPass = window.prompt(`Enter a new password for "${username}":`);
    if (!newPass) return;
    const res = await fetch('/api/users/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, newPassword: newPass })
    });
    const data = await res.json();
    if (data.success) alert('✅ Password updated successfully!');
  };

  // --- JSON BACKUP EXPORT & IMPORT ---
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `varsity-portal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        saveWorkspace(parsed);
        alert('✅ Full workspace backup restored successfully!');
      } catch (err) {
        alert('❌ Invalid JSON backup file!');
      }
    };
    reader.readAsText(file);
  };

  // --- FILTERED MATERIALS ---
  const filteredMaterials = (workspace.materials || []).filter((item) => {
    const matchesSearch =
      item.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // --- CALCULATE ATTENDANCE, CGPA & DAILY MATRIX EFFICIENCY ---
  const attendancePct = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : '0.0';
  const totalCredits = cgpaCourses.reduce((sum, c) => sum + Number(c.credit || 0), 0);
  const calculatedCGPA =
    totalCredits > 0
      ? (cgpaCourses.reduce((sum, c) => sum + Number(c.credit || 0) * Number(c.gpa || 0), 0) / totalCredits).toFixed(2)
      : '0.00';

  const matrixItems = workspace.dailyMatrix || [];
  const completedMatrixCount = matrixItems.filter((i) => i.completed).length;
  const matrixEfficiency = matrixItems.length > 0 ? Math.round((completedMatrixCount / matrixItems.length) * 100) : 0;

  // ============================================================================
  // LOGIN SCREEN
  // ============================================================================
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '32px 24px', color: '#f8fafc', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>💻</div>
            <h2 style={{ margin: 0, letterSpacing: '1px', fontSize: '22px' }}>MY SERVER PORTAL</h2>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#94a3b8' }}>Smart Varsity Hub & Academic Cloud</p>
          </div>

          {loginError && (
            <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '12px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px', fontSize: '14px', border: '1px solid #ef4444' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>USERNAME</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="e.g. admin or B54SC"
                required
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '15px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '15px' }}
              />
            </div>

            <button
              type="submit"
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px' }}
            >
              ACCESS SERVER
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN PORTAL DASHBOARD
  // ============================================================================
  return (
    <div style={{ minHeight: '100vh', background: '#0b1120', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* TOP HEADER BAR */}
      <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '26px' }}>🎓</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Varsity Smart Portal</h1>
            <span style={{ fontSize: '11px', color: '#38bdf8' }}>{syncStatus} • {currentUser.name} ({currentUser.role})</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'dashboard', label: '🏠 Dashboard' },
            { id: 'varsity', label: '📚 Materials' },
            { id: 'routine', label: '📅 Smart Routine' },
            { id: 'tools', label: '🍅 Study Tools' },
            { id: 'qna', label: '💬 Q&A Forum' },
            { id: 'blog', label: '📝 Notice/Blog' },
            ...(isAdmin ? [{ id: 'admin', label: '🛡️ User Control' }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#3b82f6' : '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal'
              }}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
          >
            Logout
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
        
        {/* HIGH-PRIORITY PINNED NOTICE BANNER & LIVE EXAM COUNTDOWN */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #ef4444', borderRadius: '14px', padding: '16px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(239,68,68,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ background: '#ef4444', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                  HIGH PRIORITY NOTICE
                </span>
                <button
                  onClick={() => shareToWhatsApp(workspace.pinnedNotice, `⏳ ${workspace.examCountdown?.title}: ${timeLeft}`)}
                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  📲 Share on WhatsApp
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', lineHeight: 1.4 }}>{workspace.pinnedNotice}</p>
            </div>

            {/* Live Countdown Box */}
            <div style={{ background: '#090d16', padding: '12px 18px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'right', minWidth: '220px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>⏳ {workspace.examCountdown?.title || 'Upcoming Exam'}</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8', fontFamily: 'monospace' }}>{timeLeft}</div>
            </div>
          </div>

          {/* Admin Quick Edit for Notice & Countdown */}
          {canEdit && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #334155', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                value={workspace.pinnedNotice}
                onChange={(e) => setWorkspace({ ...workspace, pinnedNotice: e.target.value })}
                placeholder="Edit pinned notice text..."
                style={{ flex: 1, minWidth: '200px', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px 10px', borderRadius: '6px', fontSize: '13px' }}
              />
              <input
                value={workspace.examCountdown?.title || ''}
                onChange={(e) => setWorkspace({ ...workspace, examCountdown: { ...workspace.examCountdown, title: e.target.value } })}
                placeholder="Exam Title"
                style={{ width: '160px', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px 10px', borderRadius: '6px', fontSize: '13px' }}
              />
              <input
                type="datetime-local"
                value={workspace.examCountdown?.date || ''}
                onChange={(e) => setWorkspace({ ...workspace, examCountdown: { ...workspace.examCountdown, date: e.target.value } })}
                style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px 10px', borderRadius: '6px', fontSize: '13px' }}
              />
              <button
                onClick={() => saveWorkspace(workspace)}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
              >
                Save Banner
              </button>
            </div>
          )}
        </div>

        {/* "NOW & UP NEXT" LIVE CLASS HIGHLIGHTER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #10b981', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', marginBottom: '4px' }}>🟢 NOW RUNNING ({todayName})</div>
            {ongoingClass ? (
              <div>
                <div style={{ fontSize: '17px', fontWeight: 'bold' }}>{ongoingClass.course} ({ongoingClass.room})</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>{ongoingClass.startTime} - {ongoingClass.endTime} • {ongoingClass.teacher}</div>
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>No class is currently running right now.</div>
            )}
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #38bdf8', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>⏭️ UP NEXT TODAY</div>
            {nextClass ? (
              <div>
                <div style={{ fontSize: '17px', fontWeight: 'bold' }}>{nextClass.course} ({nextClass.room})</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>Starts at {nextClass.startTime} • {nextClass.teacher}</div>
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>No more classes scheduled for today! 🎉</div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: DASHBOARD (SMART DAILY ACTIVITY MATRIX - NO MATERIALS LIST)*/}
        {/* ================================================================= */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Top Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
              <div onClick={() => setActiveTab('varsity')} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', cursor: 'pointer' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>📚 Total Course Materials</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#38bdf8', margin: '6px 0' }}>{(workspace.materials || []).length}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Click to open Materials Vault →</div>
              </div>

              <div onClick={() => setActiveTab('routine')} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', cursor: 'pointer' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>📅 Today's Scheduled Classes</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', margin: '6px 0' }}>{todaysClasses.length}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Day: {todayName} →</div>
              </div>

              <div onClick={() => setActiveTab('qna')} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', cursor: 'pointer' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>💬 Active Q&A Discussions</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#c084fc', margin: '6px 0' }}>{(workspace.discussions || []).length}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Click to join forum →</div>
              </div>

              <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>⚡ Daily Matrix Efficiency</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: matrixEfficiency >= 75 ? '#4ade80' : '#eab308', margin: '6px 0' }}>
                  {matrixEfficiency}%
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{completedMatrixCount} of {matrixItems.length} Daily Goals Done</div>
              </div>
            </div>

            {/* SMART DAILY ACTIVITY MATRIX */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              
              {/* Interactive Daily Activity & Habit Matrix */}
              <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', color: '#38bdf8' }}>📊 Smart Daily Activity Matrix</h3>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Track daily academic goals & study blocks</span>
                  </div>
                  <span style={{ background: '#0f172a', color: '#4ade80', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #334155' }}>
                    {matrixEfficiency}% Done
                  </span>
                </div>

                {/* Add New Matrix Activity (Admin/Editor) */}
                {canEdit && (
                  <form onSubmit={handleAddMatrixItem} style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <input
                      value={matrixTask}
                      onChange={(e) => setMatrixTask(e.target.value)}
                      placeholder="Add daily activity..."
                      required
                      style={{ flex: 1, minWidth: '140px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
                    />
                    <select
                      value={matrixCategory}
                      onChange={(e) => setMatrixCategory(e.target.value)}
                      style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="Academic">Academic</option>
                      <option value="Self Study">Self Study</option>
                      <option value="Skill">Skill</option>
                      <option value="Task">Task</option>
                    </select>
                    <input
                      value={matrixTarget}
                      onChange={(e) => setMatrixTarget(e.target.value)}
                      placeholder="Target (e.g. 1 Hr)"
                      style={{ width: '95px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
                    />
                    <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                      +
                    </button>
                  </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {matrixItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#0f172a',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: item.completed ? '1px solid #10b981' : '1px solid #334155',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleMatrixItem(item.id)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#64748b' : '#f8fafc' }}>
                            {item.activity}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            <span style={{ color: '#38bdf8' }}>{item.category}</span> • Target: {item.target}
                          </div>
                        </div>
                      </label>

                      {canEdit && (
                        <button
                          onClick={() => handleDeleteMatrixItem(item.id)}
                          style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Class Timeline & Recent Portal Activity Feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#1e293b', padding: '18px', borderRadius: '12px', border: '1px solid #334155' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#10b981' }}>🕒 Today's Class Timeline ({todayName})</h3>
                  {todaysClasses.length === 0 ? (
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>No classes scheduled for today. Great day for self-study!</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {todaysClasses.map((c) => (
                        <div key={c.id} style={{ background: '#0f172a', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #38bdf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{c.course} • {c.room}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{c.teacher}</div>
                          </div>
                          <span style={{ fontFamily: 'monospace', fontSize: '12px', background: '#1e293b', padding: '4px 8px', borderRadius: '6px', color: '#38bdf8' }}>
                            {c.startTime} - {c.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ background: '#1e293b', padding: '18px', borderRadius: '12px', border: '1px solid #334155' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#c084fc' }}>⚡ Latest Portal Updates</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    {(workspace.materials || []).slice(0, 2).map((m) => (
                      <div key={m.id} onClick={() => setActiveTab('varsity')} style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📄 <strong>{m.course}:</strong> {m.title}</span>
                        <span style={{ color: '#38bdf8', fontSize: '11px' }}>View in Materials →</span>
                      </div>
                    ))}
                    {(workspace.blogs || []).slice(0, 1).map((b) => (
                      <div key={b.id} onClick={() => setActiveTab('blog')} style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📝 <strong>Notice:</strong> {b.title}</span>
                        <span style={{ color: '#10b981', fontSize: '11px' }}>Read →</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: MATERIALS HUB (ONLY IN MATERIALS TAB)                      */}
        {/* ================================================================= */}
        {activeTab === 'varsity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Upload / Edit Material Form (Admin/Editor) */}
            {canEdit && (
              <form onSubmit={handleSaveMaterial} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: editingMaterialId ? '2px solid #eab308' : '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: editingMaterialId ? '#eab308' : '#38bdf8' }}>
                    {editingMaterialId ? '✏️ Edit Course Material' : '➕ Upload Course Material / Lecture Sheet'}
                  </h3>
                  {editingMaterialId && (
                    <button
                      type="button"
                      onClick={() => { setEditingMaterialId(null); setMatCourse(''); setMatTitle(''); setMatUrl(''); setMatFile(null); }}
                      style={{ background: '#475569', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <input value={matCourse} onChange={(e) => setMatCourse(e.target.value)} placeholder="Course Code (e.g. CSE-101)" required style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <input value={matTitle} onChange={(e) => setMatTitle(e.target.value)} placeholder="Topic / Lecture Title" required style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <select value={matType} onChange={(e) => setMatType(e.target.value)} style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }}>
                    <option value="PDF">PDF</option>
                    <option value="Slide">Slide</option>
                    <option value="Note">Hand Note</option>
                    <option value="Question">Question Bank</option>
                  </select>
                  <input value={matUrl} onChange={(e) => setMatUrl(e.target.value)} placeholder="External Drive/Direct Link (Optional)" style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.pptx" onChange={handleFileChange} style={{ fontSize: '13px', color: '#94a3b8' }} />
                  <button type="submit" style={{ background: editingMaterialId ? '#eab308' : '#10b981', color: editingMaterialId ? '#000' : '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {editingMaterialId ? '💾 Update Material' : '+ Publish Material'}
                  </button>
                </div>
              </form>
            )}

            {/* Instant Search & Filter Bar */}
            <div style={{ background: '#1e293b', padding: '14px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '17px' }}>📚 Course Materials & Lecture Vault</h3>
              <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '500px' }}>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search by course code or topic title..."
                  style={{ flex: 1, background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px 12px', borderRadius: '8px' }}
                />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px 12px', borderRadius: '8px' }}
                >
                  <option value="All">All Types</option>
                  <option value="PDF">PDF</option>
                  <option value="Slide">Slide</option>
                  <option value="Note">Note</option>
                  <option value="Question">Question</option>
                </select>
              </div>
            </div>

            {/* Materials Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {filteredMaterials.map((item) => {
                const fileSource = item.fileData || item.externalUrl;
                return (
                  <div key={item.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ background: '#3b82f6', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                          {item.course}
                        </span>
                        <span style={{ background: '#0f172a', color: '#94a3b8', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', border: '1px solid #334155' }}>
                          {item.type} • {item.date}
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '16px', lineHeight: 1.4 }}>{item.title}</h4>
                      {item.fileName && <div style={{ fontSize: '12px', color: '#94a3b8' }}>📎 {item.fileName}</div>}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #334155' }}>
                      {fileSource && (
                        <>
                          <button
                            onClick={() => setPreviewItem({ title: item.title, url: fileSource })}
                            style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            👁️ Preview
                          </button>
                          <a
                            href={fileSource}
                            download={item.fileName || `${item.title}.pdf`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            ⬇️ Download
                          </a>
                        </>
                      )}
                      <button
                        onClick={() => shareToWhatsApp(`${item.course}: ${item.title}`, `Type: ${item.type}`)}
                        style={{ background: '#059669', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        📲 Share
                      </button>

                      {canEdit && (
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => startEditMaterial(item)}
                            style={{ background: '#eab308', color: '#000', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(item.id)}
                            style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: SMART DYNAMIC ROUTINE (WITH ADD, EDIT & DELETE)            */}
        {/* ================================================================= */}
        {activeTab === 'routine' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {canEdit && (
              <form onSubmit={handleSaveRoutine} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: editingRoutineId ? '2px solid #eab308' : '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: editingRoutineId ? '#eab308' : '#38bdf8' }}>
                    {editingRoutineId ? '✏️ Edit Class Slot' : '➕ Add Class Slot to Routine'}
                  </h3>
                  {editingRoutineId && (
                    <button
                      type="button"
                      onClick={() => { setEditingRoutineId(null); setRtCourse(''); setRtRoom(''); setRtTeacher(''); }}
                      style={{ background: '#475569', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <select value={rtDay} onChange={(e) => setRtDay(e.target.value)} style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }}>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <input type="time" value={rtStart} onChange={(e) => setRtStart(e.target.value)} style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <input type="time" value={rtEnd} onChange={(e) => setRtEnd(e.target.value)} style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <input value={rtCourse} onChange={(e) => setRtCourse(e.target.value)} placeholder="Course (e.g. CSE-101)" required style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <input value={rtRoom} onChange={(e) => setRtRoom(e.target.value)} placeholder="Room (e.g. 402)" style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <input value={rtTeacher} onChange={(e) => setRtTeacher(e.target.value)} placeholder="Faculty Name" style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <button type="submit" style={{ background: editingRoutineId ? '#eab308' : '#10b981', color: editingRoutineId ? '#000' : '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {editingRoutineId ? '💾 Update Slot' : '+ Add Slot'}
                  </button>
                </div>
              </form>
            )}

            <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', overflowX: 'auto' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '17px' }}>📅 Weekly Class Schedule (Today: <span style={{ color: '#38bdf8' }}>{todayName}</span>)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '10px' }}>Day</th>
                    <th style={{ padding: '10px' }}>Time</th>
                    <th style={{ padding: '10px' }}>Course</th>
                    <th style={{ padding: '10px' }}>Room</th>
                    <th style={{ padding: '10px' }}>Faculty</th>
                    {canEdit && <th style={{ padding: '10px' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {(workspace.routines || []).map((r) => {
                    const isToday = r.day.toLowerCase() === todayName.toLowerCase();
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid #1e293b', background: isToday ? 'rgba(56, 189, 248, 0.1)' : 'transparent' }}>
                        <td style={{ padding: '10px', fontWeight: isToday ? 'bold' : 'normal', color: isToday ? '#38bdf8' : '#fff' }}>
                          {r.day} {isToday && '⭐'}
                        </td>
                        <td style={{ padding: '10px', fontFamily: 'monospace' }}>{r.startTime} - {r.endTime}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.course}</td>
                        <td style={{ padding: '10px' }}>{r.room}</td>
                        <td style={{ padding: '10px', color: '#94a3b8' }}>{r.teacher}</td>
                        {canEdit && (
                          <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                            <button onClick={() => startEditRoutine(r)} style={{ background: '#eab308', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                              ✏️ Edit
                            </button>
                            <button onClick={() => handleDeleteRoutine(r.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                              🗑️
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: PRODUCTIVITY TOOLS (CUSTOM POMODORO WITH BEEP, ATT, CGPA)  */}
        {/* ================================================================= */}
        {activeTab === 'tools' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '20px' }}>
            
            {/* Custom Pomodoro Timer with Intervals & Beep-Beep Sound */}
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#f43f5e' }}>🍅 Custom Pomodoro Timer</h3>
                <span style={{ background: isBreakMode ? '#10b981' : '#3b82f6', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                  {isBreakMode ? '☕ Break Time' : '🔥 Focus Mode'} • Round {currentInterval}/{totalIntervals}
                </span>
              </div>

              {/* Custom Timer & Interval Configuration */}
              <form onSubmit={applyCustomPomodoroSettings} style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Focus (Min)</label>
                  <input type="number" min="1" max="180" value={focusMinutes} onChange={(e) => setFocusMinutes(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '5px', borderRadius: '4px', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Break (Min)</label>
                  <input type="number" min="1" max="60" value={breakMinutes} onChange={(e) => setBreakMinutes(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '5px', borderRadius: '4px', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Intervals</label>
                  <input type="number" min="1" max="20" value={totalIntervals} onChange={(e) => setTotalIntervals(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '5px', borderRadius: '4px', fontSize: '12px' }} />
                </div>
                <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                  Set
                </button>
              </form>

              {/* Countdown Display */}
              <div style={{ fontSize: '42px', fontWeight: 'bold', fontFamily: 'monospace', textAlign: 'center', margin: '12px 0', background: '#0f172a', padding: '14px', borderRadius: '10px', border: isBreakMode ? '1px solid #10b981' : '1px solid #334155', color: isBreakMode ? '#4ade80' : '#f8fafc' }}>
                {String(Math.floor(pomoSeconds / 60)).padStart(2, '0')}:{String(pomoSeconds % 60).padStart(2, '0')}
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
                <button onClick={() => setPomoRunning(!pomoRunning)} style={{ background: pomoRunning ? '#eab308' : '#10b981', color: pomoRunning ? '#000' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                  {pomoRunning ? '⏸️ Pause' : '▶️ Start Timer'}
                </button>
                <button
                  onClick={() => {
                    setPomoRunning(false);
                    setIsBreakMode(false);
                    setCurrentInterval(1);
                    setPomoSeconds(Math.max(1, Number(focusMinutes)) * 60);
                  }}
                  style={{ background: '#475569', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                >
                  🔄 Reset
                </button>
                <button onClick={playBeepAlarm} title="Test Beep-Beep Sound" style={{ background: '#334155', color: '#38bdf8', border: '1px solid #475569', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                  🔊 Test Beep
                </button>
              </div>

              <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#94a3b8' }}>✅ Quick Study Tasks</h4>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <input value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="Add a new study task..." style={{ flex: 1, background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '6px 10px', borderRadius: '6px' }} />
                <button onClick={() => { if (newTodo.trim()) { setTodoList([...todoList, { id: Date.now(), text: newTodo.trim(), done: false }]); setNewTodo(''); } }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>+</button>
              </div>
              {todoList.map((t) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #334155', fontSize: '13px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#64748b' : '#fff', cursor: 'pointer' }}>
                    <input type="checkbox" checked={t.done} onChange={() => setTodoList(todoList.map((item) => item.id === t.id ? { ...item, done: !item.done } : item))} />
                    {t.text}
                  </label>
                  <button onClick={() => setTodoList(todoList.filter((item) => item.id !== t.id))} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>

            {/* Attendance Calculator */}
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 12px', color: '#38bdf8' }}>📊 Smart Attendance Calculator</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '14px' }}>
                  Classes Attended:
                  <input type="number" value={attendedClasses} onChange={(e) => setAttendedClasses(Number(e.target.value))} style={{ width: '100%', boxSizing: 'border-box', marginTop: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '8px' }} />
                </label>
                <label style={{ fontSize: '14px' }}>
                  Total Classes Held:
                  <input type="number" value={totalClasses} onChange={(e) => setTotalClasses(Number(e.target.value))} style={{ width: '100%', boxSizing: 'border-box', marginTop: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '8px' }} />
                </label>
                <div style={{ background: '#0f172a', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid #334155', marginTop: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>Current Attendance Rate</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: attendancePct >= 75 ? '#4ade80' : '#f87171', margin: '4px 0' }}>
                    {attendancePct}%
                  </div>
                  <div style={{ fontSize: '12px', color: attendancePct >= 75 ? '#4ade80' : '#fca5a5' }}>
                    {attendancePct >= 75 ? '✅ Safe Zone (75%+ Attendance)' : '⚠️ Low Attendance! Please attend upcoming classes regularly.'}
                  </div>
                </div>
              </div>
            </div>

            {/* CGPA Calculator */}
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#c084fc' }}>🎓 Semester CGPA Calculator</h3>
                <span style={{ background: '#0f172a', color: '#c084fc', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px', border: '1px solid #a855f7' }}>
                  {calculatedCGPA}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', marginBottom: '12px' }}>
                {cgpaCourses.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px' }}>
                    <input value={c.name} onChange={(e) => { const list = [...cgpaCourses]; list[i].name = e.target.value; setCgpaCourses(list); }} placeholder="Course" style={{ flex: 1, background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '6px', borderRadius: '6px', fontSize: '13px' }} />
                    <input type="number" step="0.5" value={c.credit} onChange={(e) => { const list = [...cgpaCourses]; list[i].credit = e.target.value; setCgpaCourses(list); }} placeholder="Credit" style={{ width: '65px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '6px', borderRadius: '6px', fontSize: '13px' }} />
                    <input type="number" step="0.05" value={c.gpa} onChange={(e) => { const list = [...cgpaCourses]; list[i].gpa = e.target.value; setCgpaCourses(list); }} placeholder="GPA" style={{ width: '65px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '6px', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                ))}
              </div>
              <button onClick={() => setCgpaCourses([...cgpaCourses, { name: `Course ${cgpaCourses.length + 1}`, credit: 3, gpa: 4.0 }])} style={{ width: '100%', background: '#334155', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                + Add Another Course
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: Q&A / DOUBT CLEARING DISCUSSION FORUM                      */}
        {/* ================================================================= */}
        {activeTab === 'qna' && (
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px' }}>💬 Student Q&A & Doubt Clearing Thread</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Ask a question about any lecture, assignment, or upcoming exam..."
                style={{ flex: 1, background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '10px 14px', borderRadius: '8px' }}
              />
              <button onClick={handleAddQuestion} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Ask Question
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(workspace.discussions || []).map((post) => (
                <div key={post.id} style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: '#38bdf8' }}>👤 {post.author}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{post.time}</span>
                      {canEdit && (
                        <button onClick={() => handleDeleteQuestion(post.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: '15px' }}>{post.text}</p>

                  {/* Replies */}
                  <div style={{ paddingLeft: '16px', borderLeft: '2px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                    {(post.replies || []).map((rep) => (
                      <div key={rep.id} style={{ fontSize: '13px', background: '#1e293b', padding: '8px 12px', borderRadius: '6px' }}>
                        <strong style={{ color: '#10b981' }}>{rep.author}:</strong> {rep.text} <span style={{ fontSize: '11px', color: '#64748b' }}>({rep.time})</span>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={replyTexts[post.id] || ''}
                      onChange={(e) => setReplyTexts({ ...replyTexts, [post.id]: e.target.value })}
                      placeholder="Write a reply or answer..."
                      style={{ flex: 1, background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '6px 10px', borderRadius: '6px', fontSize: '13px' }}
                    />
                    <button onClick={() => handleAddReply(post.id)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: NOTICE / ACADEMIC BLOG (WITH ADD, EDIT & DELETE)           */}
        {/* ================================================================= */}
        {activeTab === 'blog' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {canEdit && (
              <form onSubmit={handleSaveBlog} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: editingBlogId ? '2px solid #eab308' : '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: editingBlogId ? '#eab308' : '#38bdf8' }}>
                    {editingBlogId ? '✏️ Edit Notice / Article' : '📝 Publish Detailed Notice or Article'}
                  </h3>
                  {editingBlogId && (
                    <button type="button" onClick={() => { setEditingBlogId(null); setBlogTitle(''); setBlogContent(''); }} style={{ background: '#475569', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      Cancel Edit
                    </button>
                  )}
                </div>
                <input value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Notice or Article Title..." required style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '6px' }} />
                <textarea rows={4} value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder="Write detailed announcement or article content..." required style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '6px' }} />
                <button type="submit" style={{ alignSelf: 'flex-start', background: editingBlogId ? '#eab308' : '#10b981', color: editingBlogId ? '#000' : '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {editingBlogId ? '💾 Update Post' : 'Publish Post'}
                </button>
              </form>
            )}

            {(workspace.blogs || []).map((b) => (
              <div key={b.id} style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, color: '#38bdf8' }}>{b.title}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => shareToWhatsApp(b.title, b.content)} style={{ background: '#059669', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                      📲 Share
                    </button>
                    {canEdit && (
                      <>
                        <button onClick={() => startEditBlog(b)} style={{ background: '#eab308', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDeleteBlog(b.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>By {b.author} • {b.date}</div>
                <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{b.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: ADMIN USER CONTROL (CREATE, EDIT ACCESS, DELETE, BACKUP)   */}
        {/* ================================================================= */}
        {activeTab === 'admin' && isAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* One-Click JSON Backup & Restore */}
            <div style={{ background: '#1e293b', padding: '18px', borderRadius: '12px', border: '1px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', color: '#10b981', fontSize: '16px' }}>☁️ One-Click Data Backup & Restore (JSON)</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Download a full backup of all materials, routines, and notices, or restore from a JSON file anytime.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleExportJSON} style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                  ⬇️ Download Backup (.json)
                </button>
                <label style={{ background: '#2563eb', color: '#fff', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                  ⬆️ Restore Backup
                  <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {/* Create New User Form */}
            <form onSubmit={handleCreateUser} style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#38bdf8' }}>👤 Create Student / Collaborator Account</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Username (e.g. B54SC)" required style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '8px' }} />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password" required style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '8px' }} />
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full Name / Batch" style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '8px' }} />
                <input value={newPermissions} onChange={(e) => setNewPermissions(e.target.value)} placeholder="Tabs (varsity,routine,blog)" style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '8px' }} />
                <select value={newAccessType} onChange={(e) => setNewAccessType(e.target.value)} style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '8px' }}>
                  <option value="view">👁️ Viewer (Read/Download/Share Only)</option>
                  <option value="edit">✏️ Editor (Can Upload & Edit)</option>
                </select>
              </div>
              <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                + Add Student / User
              </button>
            </form>

            {/* User List with Role Edit, Password Reset & Delete */}
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '16px' }}>👥 Registered Users ({usersList.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {usersList.map((u) => (
                  <div key={u.username} style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '10px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 'bold' }}>
                        👤 {u.username} <span style={{ fontSize: '12px', color: '#38bdf8' }}>({u.role})</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                        Access: <strong>{u.access_type}</strong> • Tabs: {u.permissions} • Last Active: {u.last_active || 'Never'}
                      </div>
                    </div>

                    {u.username !== 'admin' ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                          value={u.access_type}
                          onChange={(e) => handleUpdateUserAccess(u.username, u.permissions, e.target.value)}
                          style={{ background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '5px 8px', borderRadius: '6px', fontSize: '12px' }}
                        >
                          <option value="view">👁️ Viewer</option>
                          <option value="edit">✏️ Editor</option>
                        </select>
                        <button
                          onClick={() => handleResetUserPassword(u.username)}
                          style={{ background: '#eab308', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          🔑 Reset Pass
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.username)}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          🗑️ Delete User
                        </button>
                      </div>
                    ) : (
                      <span style={{ background: '#334155', color: '#94a3b8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
                        Full Master Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* IN-APP FILE PREVIEW MODAL */}
      {previewItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#fff' }}>📄 {previewItem.title}</h3>
            <button
              onClick={() => setPreviewItem(null)}
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕ Close Preview
            </button>
          </div>
          <iframe
            src={previewItem.url}
            title="File Preview"
            style={{ width: '100%', flex: 1, background: '#fff', borderRadius: '10px', border: 'none' }}
          />
        </div>
      )}
    </div>
  );
}
