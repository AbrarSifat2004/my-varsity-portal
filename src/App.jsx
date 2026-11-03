import React, { useState, useEffect } from 'react';

const DEFAULT_WORKSPACE = {
  pinnedNotice: '📢 Midterm examinations will start next Sunday! Please check the updated exam schedule and course materials.',
  examCountdown: {
    title: 'Midterm Examination',
    date: '2026-11-20T09:00'
  },
  notifications: [
    { id: 1, title: 'Exam Schedule Updated', text: 'New exam slots for CSE-101 and MAT-102 have been added.', time: '10:00 AM', read: false },
    { id: 2, title: 'NotebookLM Studio Ready', text: 'AI Study Guides, Audio Overview links, and Flashcards are now live in Study Tools.', time: 'Just now', read: false }
  ],
  dailyMatrix: [
    { id: 1, activity: 'Prepare Exam Syllabus Topics', category: 'Academic', target: '2 Topics', completed: true },
    { id: 2, activity: 'Review Lecture Slides & Notes', category: 'Self Study', target: '60 Mins', completed: true },
    { id: 3, activity: 'Practice Problem Solving / Coding', category: 'Skill', target: '45 Mins', completed: false }
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
    { id: 1, date: '2026-11-20', startTime: '09:00', endTime: '11:00', course: 'CSE-101', room: 'Room 402', syllabus: 'Modules 1 to 3' },
    { id: 2, date: '2026-11-22', startTime: '10:00', endTime: '12:00', course: 'MAT-102', room: 'Room 305', syllabus: 'Matrices & Determinants' }
  ],
  blogs: [
    {
      id: 1,
      title: 'Midterm Examination Preparation Guidelines',
      author: 'Master Admin',
      date: '2026-11-02',
      content: 'All students are requested to review the lecture sheets thoroughly. Check the Exam Schedule tab for exact dates and syllabus.'
    }
  ],
  discussions: [
    {
      id: 1,
      author: 'B54SC',
      text: 'Sir, what is the exact syllabus for the MAT-102 exam?',
      time: '10:30 AM',
      replies: [
        { id: 101, author: 'admin', text: 'Please check the Exam Schedule tab, syllabus details are listed there.', time: '10:45 AM' }
      ]
    }
  ],
  notebooks: [
    {
      id: 1,
      course: 'MAT-102',
      title: 'Linear Algebra & Matrix Determinants AI Notebook',
      notebookUrl: 'https://notebooklm.google.com/',
      audioOverviewUrl: '',
      summary: 'Key Takeaways:\n1. A square matrix A is invertible if and only if det(A) ≠ 0.\n2. Row operations affect determinants: swapping two rows flips the sign.\n3. Cramer’s Rule uses determinants to solve systems of linear equations.',
      sources: [
        { id: 101, title: 'Lecture 01-03: Matrix & Determinants PDF', type: 'PDF', url: 'https://notebooklm.google.com/' },
        { id: 102, title: 'MIT OpenCourseWare Linear Algebra Reference', type: 'Web Link', url: 'https://ocw.mit.edu/' }
      ],
      flashcards: [
        { id: 201, question: 'When is a square matrix A considered singular (non-invertible)?', answer: 'When its determinant is equal to zero: det(A) = 0.' },
        { id: 202, question: 'What happens to det(A) if two rows of matrix A are interchanged?', answer: 'The sign of the determinant reverses: det(B) = -det(A).' }
      ],
      faqs: [
        { id: 301, q: 'How to quickly calculate a 3x3 determinant?', a: 'Use cofactor expansion along the row or column that contains the most zeros, or apply Sarrus Rule.' }
      ]
    },
    {
      id: 2,
      course: 'CSE-101',
      title: 'Structured Programming & C Language Hub',
      notebookUrl: 'https://notebooklm.google.com/',
      audioOverviewUrl: '',
      summary: 'Key Takeaways:\n1. Pointers store memory addresses of variables.\n2. Functions help modularize code and avoid repetition.\n3. Arrays store contiguous elements of the same data type.',
      sources: [
        { id: 103, title: 'C Programming Complete Slide Deck', type: 'Slide', url: 'https://notebooklm.google.com/' }
      ],
      flashcards: [
        { id: 203, question: 'What is the difference between = and == in C?', answer: '"=" is the assignment operator, whereas "==" is the relational equality operator.' }
      ],
      faqs: [
        { id: 302, q: 'Which chapters are most important for Midterm?', a: 'Loops, Arrays, Functions, and basic Pointers.' }
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
      osc.frequency.setValueAtTime(880, ctx.currentTime + offset);
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

  // --- NOTIFICATION DROPDOWN STATE ---
  const [showNotifications, setShowNotifications] = useState(false);

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

  // Exam Schedule Form (Add & Edit)
  const [editingRoutineId, setEditingRoutineId] = useState(null);
  const [rtDate, setRtDate] = useState(new Date().toISOString().slice(0, 10));
  const [rtStart, setRtStart] = useState('09:00');
  const [rtEnd, setRtEnd] = useState('11:00');
  const [rtCourse, setRtCourse] = useState('');
  const [rtRoom, setRtRoom] = useState('');
  const [rtSyllabus, setRtSyllabus] = useState('');

  // Blog Form (Add & Edit)
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');

  // Q&A Form
  const [questionText, setQuestionText] = useState('');
  const [replyTexts, setReplyTexts] = useState({});

  // --- STUDY TOOLS: EDITABLE TIMER WITH BREAK & INTERVALS ---
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [totalIntervals, setTotalIntervals] = useState(4);
  const [currentInterval, setCurrentInterval] = useState(1);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);

  // --- STUDY TOOLS: NOTEBOOKLM AI HUB STATE ---
  const [selectedNotebookId, setSelectedNotebookId] = useState(1);
  const [nbStudioTab, setNbStudioTab] = useState('guide'); // 'guide' | 'sources' | 'flashcards' | 'faq' | 'chat'
  const [flippedCards, setFlippedCards] = useState({});

  // NotebookLM Create / Edit Form States
  const [nbCourse, setNbCourse] = useState('');
  const [nbTitle, setNbTitle] = useState('');
  const [nbUrl, setNbUrl] = useState('https://notebooklm.google.com/');
  const [nbAudioUrl, setNbAudioUrl] = useState('');
  const [nbSummary, setNbSummary] = useState('');
  const [editingNotebookId, setEditingNotebookId] = useState(null);

  // NotebookLM Sub-items Form States (Sources, Flashcards, FAQs, Chat)
  const [srcTitle, setSrcTitle] = useState('');
  const [srcType, setSrcType] = useState('PDF');
  const [srcUrl, setSrcUrl] = useState('');
  const [fcQuestion, setFcQuestion] = useState('');
  const [fcAnswer, setFcAnswer] = useState('');
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [nbPromptQuery, setNbPromptQuery] = useState('');
  const [copiedNotice, setCopiedNotice] = useState('');

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
          dailyMatrix: json.data.dailyMatrix || DEFAULT_WORKSPACE.dailyMatrix,
          notifications: json.data.notifications || DEFAULT_WORKSPACE.notifications,
          notebooks: json.data.notebooks || DEFAULT_WORKSPACE.notebooks
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

  // --- EDITABLE TIMER WITH BREAK, INTERVALS & BEEP-BEEP SOUND ---
  useEffect(() => {
    let interval = null;
    if (pomoRunning && pomoSeconds > 0) {
      interval = setInterval(() => setPomoSeconds((s) => s - 1), 1000);
    } else if (pomoRunning && pomoSeconds === 0) {
      playBeepAlarm();

      if (!isBreakMode) {
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
    if (e) e.preventDefault();
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

  const applyPresetTimer = (fMin, bMin, rounds) => {
    setFocusMinutes(fMin);
    setBreakMinutes(bMin);
    setTotalIntervals(rounds);
    setPomoRunning(false);
    setIsBreakMode(false);
    setCurrentInterval(1);
    setPomoSeconds(fMin * 60);
  };

  const skipTimerPhase = () => {
    setPomoRunning(false);
    if (!isBreakMode) {
      setIsBreakMode(true);
      setPomoSeconds(Math.max(1, Number(breakMinutes)) * 60);
    } else {
      const nextRound = currentInterval < totalIntervals ? currentInterval + 1 : 1;
      setCurrentInterval(nextRound);
      setIsBreakMode(false);
      setPomoSeconds(Math.max(1, Number(focusMinutes)) * 60);
    }
  };

  // --- NOTEBOOKLM STUDIO HANDLERS ---
  const notebooksList = workspace.notebooks || DEFAULT_WORKSPACE.notebooks;
  const activeNotebook = notebooksList.find((n) => n.id === Number(selectedNotebookId)) || notebooksList[0] || null;

  const handleSaveNotebook = (e) => {
    e.preventDefault();
    if (!nbCourse.trim() || !nbTitle.trim()) return;

    let updatedNotebooks;
    if (editingNotebookId) {
      updatedNotebooks = notebooksList.map((nb) =>
        nb.id === editingNotebookId
          ? {
              ...nb,
              course: nbCourse.trim().toUpperCase(),
              title: nbTitle.trim(),
              notebookUrl: nbUrl.trim() || 'https://notebooklm.google.com/',
              audioOverviewUrl: nbAudioUrl.trim(),
              summary: nbSummary.trim()
            }
          : nb
      );
      setEditingNotebookId(null);
    } else {
      const newNb = {
        id: Date.now(),
        course: nbCourse.trim().toUpperCase(),
        title: nbTitle.trim(),
        notebookUrl: nbUrl.trim() || 'https://notebooklm.google.com/',
        audioOverviewUrl: nbAudioUrl.trim(),
        summary: nbSummary.trim() || 'Add AI Study Guide & Key Takeaways here...',
        sources: [],
        flashcards: [],
        faqs: []
      };
      updatedNotebooks = [newNb, ...notebooksList];
      setSelectedNotebookId(newNb.id);
    }

    saveWorkspace({ ...workspace, notebooks: updatedNotebooks });
    setNbCourse('');
    setNbTitle('');
    setNbUrl('https://notebooklm.google.com/');
    setNbAudioUrl('');
    setNbSummary('');
  };

  const startEditNotebook = (nb) => {
    setEditingNotebookId(nb.id);
    setNbCourse(nb.course);
    setNbTitle(nb.title);
    setNbUrl(nb.notebookUrl || 'https://notebooklm.google.com/');
    setNbAudioUrl(nb.audioOverviewUrl || '');
    setNbSummary(nb.summary || '');
  };

  const handleDeleteNotebook = (id) => {
    if (!window.confirm('Delete this NotebookLM workspace from the portal?')) return;
    const updated = notebooksList.filter((n) => n.id !== id);
    saveWorkspace({ ...workspace, notebooks: updated });
    if (updated.length > 0) setSelectedNotebookId(updated[0].id);
  };

  const handleAddNotebookSource = (e) => {
    e.preventDefault();
    if (!activeNotebook || !srcTitle.trim()) return;
    const newSource = {
      id: Date.now(),
      title: srcTitle.trim(),
      type: srcType,
      url: srcUrl.trim() || activeNotebook.notebookUrl
    };
    const updated = notebooksList.map((nb) =>
      nb.id === activeNotebook.id ? { ...nb, sources: [...(nb.sources || []), newSource] } : nb
    );
    saveWorkspace({ ...workspace, notebooks: updated });
    setSrcTitle('');
    setSrcUrl('');
  };

  const handleDeleteNotebookSource = (sourceId) => {
    if (!activeNotebook) return;
    const updated = notebooksList.map((nb) =>
      nb.id === activeNotebook.id ? { ...nb, sources: (nb.sources || []).filter((s) => s.id !== sourceId) } : nb
    );
    saveWorkspace({ ...workspace, notebooks: updated });
  };

  const handleAddFlashcard = (e) => {
    e.preventDefault();
    if (!activeNotebook || !fcQuestion.trim() || !fcAnswer.trim()) return;
    const newCard = { id: Date.now(), question: fcQuestion.trim(), answer: fcAnswer.trim() };
    const updated = notebooksList.map((nb) =>
      nb.id === activeNotebook.id ? { ...nb, flashcards: [...(nb.flashcards || []), newCard] } : nb
    );
    saveWorkspace({ ...workspace, notebooks: updated });
    setFcQuestion('');
    setFcAnswer('');
  };

  const handleDeleteFlashcard = (cardId) => {
    if (!activeNotebook) return;
    const updated = notebooksList.map((nb) =>
      nb.id === activeNotebook.id ? { ...nb, flashcards: (nb.flashcards || []).filter((c) => c.id !== cardId) } : nb
    );
    saveWorkspace({ ...workspace, notebooks: updated });
  };

  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!activeNotebook || !faqQ.trim() || !faqA.trim()) return;
    const newFaq = { id: Date.now(), q: faqQ.trim(), a: faqA.trim() };
    const updated = notebooksList.map((nb) =>
      nb.id === activeNotebook.id ? { ...nb, faqs: [...(nb.faqs || []), newFaq] } : nb
    );
    saveWorkspace({ ...workspace, notebooks: updated });
    setFaqQ('');
    setFaqA('');
  };

  const handleDeleteFaq = (faqId) => {
    if (!activeNotebook) return;
    const updated = notebooksList.map((nb) =>
      nb.id === activeNotebook.id ? { ...nb, faqs: (nb.faqs || []).filter((f) => f.id !== faqId) } : nb
    );
    saveWorkspace({ ...workspace, notebooks: updated });
  };

  const copyPromptAndLaunchNotebookLM = (promptText, targetUrl) => {
    if (navigator.clipboard && promptText) {
      navigator.clipboard.writeText(promptText);
      setCopiedNotice('✅ Prompt copied to clipboard! Paste it inside NotebookLM.');
      setTimeout(() => setCopiedNotice(''), 4000);
    }
    window.open(targetUrl || 'https://notebooklm.google.com/', '_blank');
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

    let updatedMaterials;
    if (editingMaterialId) {
      updatedMaterials = (workspace.materials || []).map((m) => {
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
      updatedMaterials = [newMat, ...(workspace.materials || [])];

      const newNotif = { id: Date.now(), title: 'New Material Published', text: `${matCourse}: ${matTitle}`, time: 'Just now', read: false };
      saveWorkspace({ ...workspace, materials: updatedMaterials, notifications: [newNotif, ...(workspace.notifications || [])] });
      setMatCourse('');
      setMatTitle('');
      setMatType('PDF');
      setMatUrl('');
      setMatFile(null);
      return;
    }

    saveWorkspace({ ...workspace, materials: updatedMaterials });
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

  // --- EXAM SCHEDULE ADD, EDIT & DELETE ---
  const handleSaveRoutine = (e) => {
    e.preventDefault();
    if (!rtCourse.trim()) return;

    let updatedRoutines;
    if (editingRoutineId) {
      updatedRoutines = (workspace.routines || []).map((r) => {
        if (r.id === editingRoutineId) {
          return {
            ...r,
            date: rtDate,
            startTime: rtStart,
            endTime: rtEnd,
            course: rtCourse.trim().toUpperCase(),
            room: rtRoom.trim() || 'TBA',
            syllabus: rtSyllabus.trim() || 'General'
          };
        }
        return r;
      });
      setEditingRoutineId(null);
    } else {
      const newRt = {
        id: Date.now(),
        date: rtDate,
        startTime: rtStart,
        endTime: rtEnd,
        course: rtCourse.trim().toUpperCase(),
        room: rtRoom.trim() || 'TBA',
        syllabus: rtSyllabus.trim() || 'General'
      };
      updatedRoutines = [...(workspace.routines || []), newRt];

      const newNotif = { id: Date.now(), title: 'Exam Slot Added', text: `${rtCourse.toUpperCase()} exam scheduled on ${rtDate}`, time: 'Just now', read: false };
      saveWorkspace({ ...workspace, routines: updatedRoutines, notifications: [newNotif, ...(workspace.notifications || [])] });
      setRtCourse('');
      setRtRoom('');
      setRtSyllabus('');
      return;
    }

    saveWorkspace({ ...workspace, routines: updatedRoutines });
    setRtCourse('');
    setRtRoom('');
    setRtSyllabus('');
  };

  const startEditRoutine = (r) => {
    setEditingRoutineId(r.id);
    setRtDate(r.date || new Date().toISOString().slice(0, 10));
    setRtStart(r.startTime);
    setRtEnd(r.endTime);
    setRtCourse(r.course);
    setRtRoom(r.room);
    setRtSyllabus(r.syllabus || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRoutine = (id) => {
    if (!window.confirm('Delete this exam slot from the schedule?')) return;
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

  const matrixItems = workspace.dailyMatrix || [];
  const completedMatrixCount = matrixItems.filter((i) => i.completed).length;
  const matrixEfficiency = matrixItems.length > 0 ? Math.round((completedMatrixCount / matrixItems.length) * 100) : 0;
  const unreadNotifCount = (workspace.notifications || []).filter((n) => !n.read).length;

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadNotifCount > 0) {
      const updated = (workspace.notifications || []).map((n) => ({ ...n, read: true }));
      saveWorkspace({ ...workspace, notifications: updated });
    }
  };

  // --- SMART CALENDAR GENERATOR HELPER ---
  const [calendarDate, setCalendarDate] = useState(new Date());
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const examDatesSet = new Set((workspace.routines || []).map((r) => r.date));

  // Calculate Timer Progress Percentage
  const totalPhaseSeconds = (isBreakMode ? Math.max(1, Number(breakMinutes)) : Math.max(1, Number(focusMinutes))) * 60;
  const timerProgressPct = Math.min(100, Math.max(0, ((totalPhaseSeconds - pomoSeconds) / totalPhaseSeconds) * 100));

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

        {/* Navigation Tabs & Notification Bell */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'dashboard', label: '🏠 Dashboard' },
              { id: 'varsity', label: '📚 Materials' },
              { id: 'routine', label: '📅 Exam Schedule' },
              { id: 'tools', label: '🧠 Study Tools' },
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
          </nav>

          {/* Notification Bell Icon */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleOpenNotifications}
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', position: 'relative' }}
            >
              🔔
              {unreadNotifCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 5px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div style={{ position: 'absolute', right: 0, top: '42px', width: '300px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1000, padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
                  <strong style={{ fontSize: '14px', color: '#38bdf8' }}>Notifications</strong>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{(workspace.notifications || []).length} total</span>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(workspace.notifications || []).length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>No new notifications</div>
                  ) : (
                    (workspace.notifications || []).map((n) => (
                      <div key={n.id} style={{ background: '#0f172a', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #3b82f6', fontSize: '12px' }}>
                        <div style={{ fontWeight: 'bold', color: '#f8fafc' }}>{n.title}</div>
                        <div style={{ color: '#94a3b8', margin: '2px 0' }}>{n.text}</div>
                        <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'right' }}>{n.time}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
          >
            Logout
          </button>
        </div>
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

        {/* ================================================================= */}
        {/* TAB 1: DASHBOARD (CLOCK, SMART CALENDAR & ACTIVITY MATRIX)        */}
        {/* ================================================================= */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Top Widget Row: Live Clock & Smart Calendar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* Digital Live Clock Widget */}
              <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '20px', borderRadius: '14px', border: '1px solid #334155', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px' }}>🕒 LIVE SYSTEM CLOCK</div>
                <div style={{ fontSize: '38px', fontWeight: 'bold', fontFamily: 'monospace', color: '#f8fafc', letterSpacing: '2px' }}>
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>
                  {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {/* Smart Calendar Widget (Exam dates marked in RED) */}
              <div style={{ background: '#1e293b', padding: '16px', borderRadius: '14px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}>◀</button>
                  <strong style={{ fontSize: '14px', color: '#38bdf8' }}>{monthNames[month]} {year}</strong>
                  <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}>▶</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '12px' }}>
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const mStr = String(month + 1).padStart(2, '0');
                    const dStr = String(dayNum).padStart(2, '0');
                    const dateString = `${year}-${mStr}-${dStr}`;
                    const isExamDay = examDatesSet.has(dateString);
                    const isToday = new Date().toDateString() === new Date(year, month, dayNum).toDateString();

                    return (
                      <div
                        key={`day-${dayNum}`}
                        style={{
                          padding: '6px 0',
                          borderRadius: '6px',
                          background: isExamDay ? '#ef4444' : isToday ? '#3b82f6' : '#0f172a',
                          color: isExamDay || isToday ? '#fff' : '#cbd5e1',
                          fontWeight: isExamDay || isToday ? 'bold' : 'normal',
                          border: isToday ? '1px solid #93c5fd' : 'none'
                        }}
                        title={isExamDay ? 'Exam Scheduled!' : ''}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* SMART DAILY ACTIVITY MATRIX */}
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', color: '#38bdf8' }}>📊 Smart Daily Activity Matrix</h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Track daily academic preparation & study blocks</span>
                </div>
                <span style={{ background: '#0f172a', color: '#4ade80', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #334155' }}>
                  {matrixEfficiency}% Done
                </span>
              </div>

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

          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: MATERIALS HUB                                              */}
        {/* ================================================================= */}
        {activeTab === 'varsity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
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
        {/* TAB 3: EXAM SCHEDULE                                              */}
        {/* ================================================================= */}
        {activeTab === 'routine' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {canEdit && (
              <form onSubmit={handleSaveRoutine} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: editingRoutineId ? '2px solid #eab308' : '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: editingRoutineId ? '#eab308' : '#38bdf8' }}>
                    {editingRoutineId ? '✏️ Edit Exam Slot' : '➕ Add Exam Slot'}
                  </h3>
                  {editingRoutineId && (
                    <button
                      type="button"
                      onClick={() => { setEditingRoutineId(null); setRtCourse(''); setRtRoom(''); setRtSyllabus(''); }}
                      style={{ background: '#475569', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <input type="date" value={rtDate} onChange={(e) => setRtDate(e.target.value)} style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <input type="time" value={rtStart} onChange={(e) => setRtStart(e.target.value)} style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <input type="time" value={rtEnd} onChange={(e) => setRtEnd(e.target.value)} style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <input value={rtCourse} onChange={(e) => setRtCourse(e.target.value)} placeholder="Course (e.g. CSE-101)" required style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <input value={rtRoom} onChange={(e) => setRtRoom(e.target.value)} placeholder="Room (e.g. 402)" style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <input value={rtSyllabus} onChange={(e) => setRtSyllabus(e.target.value)} placeholder="Syllabus" style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px' }} />
                  <button type="submit" style={{ background: editingRoutineId ? '#eab308' : '#10b981', color: editingRoutineId ? '#000' : '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {editingRoutineId ? '💾 Update Slot' : '+ Add Slot'}
                  </button>
                </div>
              </form>
            )}

            <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', overflowX: 'auto' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '17px' }}>📅 Exam Schedule</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Time</th>
                    <th style={{ padding: '10px' }}>Course</th>
                    <th style={{ padding: '10px' }}>Room</th>
                    <th style={{ padding: '10px' }}>Syllabus</th>
                    {canEdit && <th style={{ padding: '10px' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {(workspace.routines || []).map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#38bdf8' }}>{r.date}</td>
                      <td style={{ padding: '10px', fontFamily: 'monospace' }}>{r.startTime} - {r.endTime}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.course}</td>
                      <td style={{ padding: '10px' }}>{r.room}</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{r.syllabus}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: STUDY TOOLS (EDITABLE TIMER + NOTEBOOKLM AI STUDIO)        */}
        {/* ================================================================= */}
        {activeTab === 'tools' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* SECTION 1: EDITABLE STUDY TIMER WITH BREAK & INTERVALS */}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '24px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 8px 25px rgba(0,0,0,0.35)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '19px', color: '#38bdf8' }}>⏱️ Editable Focus Timer (With Break & Intervals)</h3>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Customize focus duration, break time, and session intervals with auto beep-beep alarm</span>
                </div>

                {/* Quick Presets */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => applyPresetTimer(25, 5, 4)} style={{ background: '#0f172a', color: '#38bdf8', border: '1px solid #334155', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                    🍅 Classic (25m / 5m × 4)
                  </button>
                  <button onClick={() => applyPresetTimer(50, 10, 3)} style={{ background: '#0f172a', color: '#10b981', border: '1px solid #334155', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                    🔥 Deep Work (50m / 10m × 3)
                  </button>
                  <button onClick={() => applyPresetTimer(15, 3, 6)} style={{ background: '#0f172a', color: '#c084fc', border: '1px solid #334155', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                    ⚡ SprintRevision (15m / 3m × 6)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'center' }}>
                
                {/* Left: Timer Display & Controls */}
                <div style={{ background: '#090d16', padding: '20px', borderRadius: '14px', border: isBreakMode ? '2px solid #10b981' : '2px solid #3b82f6', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ background: isBreakMode ? '#10b981' : '#3b82f6', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {isBreakMode ? '☕ BREAK SESSION' : '🔥 FOCUS SESSION'}
                    </span>
                    <span style={{ background: '#1e293b', color: '#cbd5e1', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #334155' }}>
                      Interval {currentInterval} of {totalIntervals}
                    </span>
                  </div>

                  <div style={{ fontSize: '56px', fontWeight: 'bold', fontFamily: 'monospace', color: isBreakMode ? '#4ade80' : '#f8fafc', margin: '10px 0', letterSpacing: '3px' }}>
                    {String(Math.floor(pomoSeconds / 60)).padStart(2, '0')}:{String(pomoSeconds % 60).padStart(2, '0')}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ width: `${timerProgressPct}%`, height: '100%', background: isBreakMode ? '#10b981' : '#38bdf8', transition: 'width 0.4s ease' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setPomoRunning(!pomoRunning)}
                      style={{ background: pomoRunning ? '#eab308' : '#10b981', color: pomoRunning ? '#000' : '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                    >
                      {pomoRunning ? '⏸️ Pause' : '▶️ Start'}
                    </button>
                    <button
                      onClick={skipTimerPhase}
                      style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                    >
                      ⏭️ Skip Phase
                    </button>
                    <button
                      onClick={() => applyCustomPomodoroSettings()}
                      style={{ background: '#475569', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      🔄 Reset
                    </button>
                    <button
                      onClick={playBeepAlarm}
                      style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      🔊 Test Beep
                    </button>
                  </div>
                </div>

                {/* Right: Editable Timer Settings Form */}
                <form onSubmit={applyCustomPomodoroSettings} style={{ background: '#0f172a', padding: '20px', borderRadius: '14px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '15px' }}>⚙️ Customize Timer & Interval Settings</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Focus (Mins)</label>
                      <input
                        type="number"
                        min="1"
                        max="240"
                        value={focusMinutes}
                        onChange={(e) => setFocusMinutes(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Break (Mins)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={breakMinutes}
                        onChange={(e) => setBreakMinutes(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Intervals</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={totalIntervals}
                        onChange={(e) => setTotalIntervals(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold' }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '11px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                  >
                    ✅ Apply Custom Timer Settings
                  </button>
                </form>

              </div>
            </div>

            {/* SECTION 2: NOTEBOOKLM AI RESEARCH & STUDY STUDIO (ALL FACILITIES LINKED) */}
            <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #38bdf8', boxShadow: '0 8px 30px rgba(56, 189, 248, 0.12)' }}>
              
              {/* Studio Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid #334155', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '34px' }}>📓</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>Google NotebookLM AI Study Studio</h3>
                      <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                        ALL FACILITIES LINKED
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                      Access Course Notebooks, Audio Overviews (Deep Dive Podcasts), Study Guides, Source Vault, 3D Flashcards & AI Prompt Launcher
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a
                    href="https://notebooklm.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    🚀 Launch Google NotebookLM ↗
                  </a>
                  {activeNotebook && (
                    <a
                      href={activeNotebook.notebookUrl || 'https://notebooklm.google.com/'}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: '#10b981', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px' }}
                    >
                      📂 Open "{activeNotebook.course}" Notebook ↗
                    </a>
                  )}
                </div>
              </div>

              {copiedNotice && (
                <div style={{ background: '#065f46', color: '#a7f3d0', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #10b981' }}>
                  {copiedNotice}
                </div>
              )}

              {/* Course Notebook Selector Tabs */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 'bold' }}>Active Course Notebook:</span>
                {notebooksList.map((nb) => (
                  <button
                    key={nb.id}
                    onClick={() => setSelectedNotebookId(nb.id)}
                    style={{
                      background: activeNotebook?.id === nb.id ? '#38bdf8' : '#0f172a',
                      color: activeNotebook?.id === nb.id ? '#000' : '#f8fafc',
                      border: '1px solid #334155',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    📘 {nb.course}: {nb.title}
                  </button>
                ))}
              </div>

              {/* Active NotebookLM Workspace View */}
              {activeNotebook && (
                <div style={{ background: '#0f172a', borderRadius: '14px', border: '1px solid #334155', padding: '20px', marginBottom: '20px' }}>
                  
                  {/* Notebook Top Info & Audio Overview Player */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #1e293b' }}>
                    <div>
                      <span style={{ background: '#3b82f6', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                        {activeNotebook.course}
                      </span>
                      <h4 style={{ margin: '8px 0 4px', fontSize: '18px', color: '#f8fafc' }}>{activeNotebook.title}</h4>
                      <a href={activeNotebook.notebookUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#38bdf8', textDecoration: 'underline' }}>
                        {activeNotebook.notebookUrl}
                      </a>
                    </div>

                    {/* Audio Overview (Deep Dive Podcast) Box */}
                    <div style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '12px', border: '1px solid #475569', minWidth: '270px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#c084fc', marginBottom: '6px' }}>
                        🎧 NotebookLM Audio Overview (AI Podcast)
                      </div>
                      {activeNotebook.audioOverviewUrl ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <audio controls src={activeNotebook.audioOverviewUrl} style={{ width: '100%', height: '32px' }} />
                          <a href={activeNotebook.audioOverviewUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#38bdf8' }}>
                            Open External Audio Stream ↗
                          </a>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Generate or listen in NotebookLM Studio</span>
                          <a
                            href={activeNotebook.notebookUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ background: '#8b5cf6', color: '#fff', textDecoration: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}
                          >
                            🎧 Listen ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NotebookLM Facility Sub-Navigation */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                    {[
                      { id: 'guide', label: '📝 Study Guide & Briefing Doc' },
                      { id: 'sources', label: `📄 Source Grounding (${(activeNotebook.sources || []).length})` },
                      { id: 'flashcards', label: `🃏 3D Study Flashcards (${(activeNotebook.flashcards || []).length})` },
                      { id: 'faq', label: `❓ Generated FAQs (${(activeNotebook.faqs || []).length})` },
                      { id: 'chat', label: '💬 AI Query & Prompt Launcher' }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setNbStudioTab(sub.id)}
                        style={{
                          background: nbStudioTab === sub.id ? '#2563eb' : '#1e293b',
                          color: '#fff',
                          border: '1px solid #334155',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: nbStudioTab === sub.id ? 'bold' : 'normal'
                        }}
                      >
                        {sub.label}
                      </button>
                    ))}

                    {canEdit && (
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => startEditNotebook(activeNotebook)}
                          style={{ background: '#eab308', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ✏️ Edit Notebook
                        </button>
                        <button
                          onClick={() => handleDeleteNotebook(activeNotebook.id)}
                          style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  {/* FACILITY 1: STUDY GUIDE & BRIEFING SUMMARY */}
                  {nbStudioTab === 'guide' && (
                    <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: '#38bdf8' }}>📌 NotebookLM Briefing Doc & Executive Summary</h4>
                        <button
                          onClick={() => shareToWhatsApp(`${activeNotebook.course} Study Guide`, activeNotebook.summary)}
                          style={{ background: '#059669', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          📲 Share Summary
                        </button>
                      </div>
                      <p style={{ margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: '14px', color: '#e2e8f0' }}>
                        {activeNotebook.summary}
                      </p>
                    </div>
                  )}

                  {/* FACILITY 2: SOURCE GROUNDING VAULT (PDFs, Docs, Links, YouTube) */}
                  {nbStudioTab === 'sources' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {canEdit && (
                        <form onSubmit={handleAddNotebookSource} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
                          <input
                            value={srcTitle}
                            onChange={(e) => setSrcTitle(e.target.value)}
                            placeholder="Source Name (e.g. Chapter 4 PDF or YouTube Lecture)"
                            required
                            style={{ flex: 1, minWidth: '180px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
                          />
                          <select
                            value={srcType}
                            onChange={(e) => setSrcType(e.target.value)}
                            style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
                          >
                            <option value="PDF">📄 PDF Document</option>
                            <option value="Google Doc">📝 Google Doc / Slide</option>
                            <option value="YouTube">▶️ YouTube Video</option>
                            <option value="Web Link">🌐 Website URL</option>
                          </select>
                          <input
                            value={srcUrl}
                            onChange={(e) => setSrcUrl(e.target.value)}
                            placeholder="Direct Source or NotebookLM Link..."
                            style={{ flex: 1, minWidth: '180px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
                          />
                          <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                            + Add Source
                          </button>
                        </form>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                        {(activeNotebook.sources || []).map((s) => (
                          <div key={s.id} style={{ background: '#1e293b', padding: '12px', borderRadius: '10px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                            <div>
                              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>{s.type}</span>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0' }}>{s.title}</div>
                              <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#10b981', textDecoration: 'none', fontWeight: 'bold' }}>
                                Open Source ↗
                              </a>
                            </div>
                            {canEdit && (
                              <button onClick={() => handleDeleteNotebookSource(s.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FACILITY 3: INTERACTIVE 3D FLIP FLASHCARDS */}
                  {nbStudioTab === 'flashcards' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {canEdit && (
                        <form onSubmit={handleAddFlashcard} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
                          <input
                            value={fcQuestion}
                            onChange={(e) => setFcQuestion(e.target.value)}
                            placeholder="Front: Question / Term / Formula..."
                            required
                            style={{ flex: 1, minWidth: '200px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
                          />
                          <input
                            value={fcAnswer}
                            onChange={(e) => setFcAnswer(e.target.value)}
                            placeholder="Back: Answer / Explanation..."
                            required
                            style={{ flex: 1, minWidth: '200px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
                          />
                          <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                            + Add Flashcard
                          </button>
                        </form>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '14px' }}>
                        {(activeNotebook.flashcards || []).map((card) => {
                          const isFlipped = !!flippedCards[card.id];
                          return (
                            <div
                              key={card.id}
                              onClick={() => setFlippedCards({ ...flippedCards, [card.id]: !isFlipped })}
                              style={{
                                background: isFlipped ? 'linear-gradient(135deg, #065f46, #0f172a)' : 'linear-gradient(135deg, #1e293b, #0f172a)',
                                border: isFlipped ? '1px solid #10b981' : '1px solid #38bdf8',
                                borderRadius: '12px',
                                padding: '18px',
                                minHeight: '120px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transition: 'all 0.25s ease'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: isFlipped ? '#4ade80' : '#38bdf8' }}>
                                  {isFlipped ? '💡 ANSWER (Click to Flip)' : '❓ QUESTION (Click to Reveal)'}
                                </span>
                                {canEdit && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteFlashcard(card.id); }}
                                    style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                              <div style={{ fontSize: '15px', fontWeight: '500', margin: '12px 0', color: '#f8fafc', lineHeight: 1.5 }}>
                                {isFlipped ? card.answer : card.question}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* FACILITY 4: GENERATED FAQs */}
                  {nbStudioTab === 'faq' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {canEdit && (
                        <form onSubmit={handleAddFaq} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
                          <input
                            value={faqQ}
                            onChange={(e) => setFaqQ(e.target.value)}
                            placeholder="Frequently Asked Question..."
                            required
                            style={{ flex: 1, minWidth: '200px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
                          />
                          <input
                            value={faqA}
                            onChange={(e) => setFaqA(e.target.value)}
                            placeholder="Detailed Answer..."
                            required
                            style={{ flex: 1, minWidth: '200px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
                          />
                          <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                            + Add FAQ
                          </button>
                        </form>
                      )}

                      {(activeNotebook.faqs || []).map((f) => (
                        <div key={f.id} style={{ background: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <strong style={{ color: '#38bdf8', fontSize: '14px' }}>Q: {f.q}</strong>
                            {canEdit && (
                              <button onClick={() => handleDeleteFaq(f.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                                ✕
                              </button>
                            )}
                          </div>
                          <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>A: {f.a}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* FACILITY 5: AI QUERY & ONE-CLICK NOTEBOOKLM PROMPT LAUNCHER */}
                  {nbStudioTab === 'chat' && (
                    <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h4 style={{ margin: 0, color: '#38bdf8' }}>🤖 Ask NotebookLM AI Grounded Assistant</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                        Write your question or select a smart academic prompt below. Clicking launch will automatically copy your prompt and open your linked Google NotebookLM workspace!
                      </p>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <input
                          value={nbPromptQuery}
                          onChange={(e) => setNbPromptQuery(e.target.value)}
                          placeholder={`Ask anything about ${activeNotebook.course} sources...`}
                          style={{ flex: 1, minWidth: '220px', background: '#0f172a', color: '#fff', border: '1px solid #475569', padding: '10px 12px', borderRadius: '8px', fontSize: '14px' }}
                        />
                        <button
                          onClick={() => copyPromptAndLaunchNotebookLM(nbPromptQuery, activeNotebook.notebookUrl)}
                          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                        >
                          🚀 Copy Question & Ask in NotebookLM ↗
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {[
                          'Generate a comprehensive Midterm Study Guide from all uploaded sources.',
                          'Create 10 high-yield Viva & Short Questions with step-by-step answers.',
                          'Explain the most complex mathematical derivations in simple terms with examples.',
                          'Summarize key formulas and create a quick revision cheat-sheet.'
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => copyPromptAndLaunchNotebookLM(preset, activeNotebook.notebookUrl)}
                            style={{ background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', textAlign: 'left' }}
                          >
                            ⚡ "{preset}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Admin / Editor Form: Create or Edit Linked Course Notebook */}
              {canEdit && (
                <form onSubmit={handleSaveNotebook} style={{ background: '#0f172a', padding: '18px', borderRadius: '12px', border: editingNotebookId ? '2px solid #eab308' : '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: editingNotebookId ? '#eab308' : '#10b981', fontSize: '15px' }}>
                      {editingNotebookId ? '✏️ Edit Linked NotebookLM Workspace' : '➕ Link New Course NotebookLM Workspace'}
                    </h4>
                    {editingNotebookId && (
                      <button
                        type="button"
                        onClick={() => { setEditingNotebookId(null); setNbCourse(''); setNbTitle(''); setNbUrl('https://notebooklm.google.com/'); setNbAudioUrl(''); setNbSummary(''); }}
                        style={{ background: '#475569', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    <input value={nbCourse} onChange={(e) => setNbCourse(e.target.value)} placeholder="Course Code (e.g. CSE-201)" required style={{ background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '9px', borderRadius: '6px', fontSize: '13px' }} />
                    <input value={nbTitle} onChange={(e) => setNbTitle(e.target.value)} placeholder="Notebook Title (e.g. Data Structures AI Hub)" required style={{ background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '9px', borderRadius: '6px', fontSize: '13px' }} />
                    <input value={nbUrl} onChange={(e) => setNbUrl(e.target.value)} placeholder="Shared NotebookLM URL (https://notebooklm.google.com/...)" style={{ background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '9px', borderRadius: '6px', fontSize: '13px' }} />
                    <input value={nbAudioUrl} onChange={(e) => setNbAudioUrl(e.target.value)} placeholder="Audio Overview MP3/Drive Link (Optional)" style={{ background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '9px', borderRadius: '6px', fontSize: '13px' }} />
                  </div>

                  <textarea
                    rows={3}
                    value={nbSummary}
                    onChange={(e) => setNbSummary(e.target.value)}
                    placeholder="Paste NotebookLM AI Study Guide / Key Takeaways / Briefing Summary here..."
                    style={{ background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '10px', borderRadius: '6px', fontSize: '13px' }}
                  />

                  <button type="submit" style={{ alignSelf: 'flex-start', background: editingNotebookId ? '#eab308' : '#10b981', color: editingNotebookId ? '#000' : '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                    {editingNotebookId ? '💾 Update NotebookLM Hub' : '+ Add & Link NotebookLM'}
                  </button>
                </form>
              )}

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

                  <div style={{ paddingLeft: '16px', borderLeft: '2px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                    {(post.replies || []).map((rep) => (
                      <div key={rep.id} style={{ fontSize: '13px', background: '#1e293b', padding: '8px 12px', borderRadius: '6px' }}>
                        <strong style={{ color: '#10b981' }}>{rep.author}:</strong> {rep.text} <span style={{ fontSize: '11px', color: '#64748b' }}>({rep.time})</span>
                      </div>
                    ))}
                  </div>

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
        {/* TAB 6: NOTICE / ACADEMIC BLOG                                     */}
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
        {/* TAB 7: ADMIN USER CONTROL                                         */}
        {/* ================================================================= */}
        {activeTab === 'admin' && isAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ background: '#1e293b', padding: '18px', borderRadius: '12px', border: '1px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', color: '#10b981', fontSize: '16px' }}>☁️ One-Click Data Backup & Restore (JSON)</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Download a full backup of all materials, exams, NotebookLM data, and notices, or restore anytime.</p>
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
