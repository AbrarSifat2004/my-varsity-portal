const express = require('express');
const session = require('express-session');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const db = new Database(path.join(__dirname, 'cloud_hub.db'));

// Middleware
app.use(cors());
// 50MB limit so PDF, Word, PPTX, Excel files can be uploaded and synced
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'cloud-secret-key-varsity-123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 Days
}));

// Initialize SQLite Tables (Users + Global Shared Workspace State)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT,
    permissions TEXT,
    access_type TEXT DEFAULT 'view'
  );

  CREATE TABLE IF NOT EXISTS app_workspace (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT
  );
`);

// Seed Default Users (Admin & Default Student Viewer)
const adminPass = bcrypt.hashSync('admin123', 10);
const userPass = bcrypt.hashSync('user123', 10);

db.prepare(`
  INSERT OR IGNORE INTO users (username, password, name, role, permissions, access_type) 
  VALUES ('admin', ?, 'Main Admin', 'admin', 'all', 'edit')
`).run(adminPass);

db.prepare(`
  INSERT OR IGNORE INTO users (username, password, name, role, permissions, access_type) 
  VALUES ('varsity_user', ?, 'Varsity Student', 'user', 'varsity', 'view')
`).run(userPass);

// --- API ROUTES ---

// 1. Login Route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    res.json({ 
      success: true, 
      user: { 
        username: user.username, 
        name: user.name, 
        role: user.role, 
        permissions: user.permissions,
        access_type: user.access_type 
      } 
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials!' });
  }
});

// 2. Get Shared Workspace Data (So Students & Admin see the exact same live data)
app.get('/api/workspace', (req, res) => {
  const row = db.prepare('SELECT data FROM app_workspace WHERE id = 1').get();
  res.json({ success: true, data: row ? JSON.parse(row.data) : null });
});

// 3. Save Shared Workspace Data
app.post('/api/workspace', (req, res) => {
  const dataStr = JSON.stringify(req.body.data);
  db.prepare('INSERT OR REPLACE INTO app_workspace (id, data) VALUES (1, ?)').run(dataStr);
  res.json({ success: true });
});

// 4. Admin: Get All Users
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT id, username, name, role, permissions, access_type FROM users').all();
  res.json({ success: true, users });
});

// 5. Admin: Update User Permissions & Access Type
app.post('/api/users/update', (req, res) => {
  const { username, permissions, access_type } = req.body;
  db.prepare('UPDATE users SET permissions = ?, access_type = ? WHERE username = ?')
    .run(permissions, access_type, username);
  res.json({ success: true });
});

// 6. Admin: Create New Student / User Account
app.post('/api/users/create', (req, res) => {
  const { username, password, name, permissions, access_type } = req.body;
  try {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(`
      INSERT INTO users (username, password, name, role, permissions, access_type) 
      VALUES (?, ?, ?, 'user', ?, ?)
    `).run(username, hash, name || username, permissions, access_type);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Username already exists!' });
  }
});

// --- SERVE REACT FRONTEND BUILD FOR ONLINE DEPLOYMENT ---
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running globally on port ${PORT}`);
});