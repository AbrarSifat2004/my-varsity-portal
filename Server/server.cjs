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
        role TEXT DEFAULT 'user',
        permissions TEXT DEFAULT 'varsity',
        access_type TEXT DEFAULT 'view'
    );

    CREATE TABLE IF NOT EXISTS workspace (
        key TEXT PRIMARY KEY,
        data TEXT
    );
`);

// Seed Default Admin & Student Accounts if not exist
const adminCheck = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminCheck) {
    const hashedPass = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password, name, role, permissions, access_type) VALUES (?, ?, ?, ?, ?, ?)').run(
        'admin', hashedPass, 'Master Admin', 'admin', 'all', 'edit'
    );
}

const userCheck = db.prepare('SELECT * FROM users WHERE username = ?').get('B54SC');
if (!userCheck) {
    const hashedPass = bcrypt.hashSync('@ust', 10);
    db.prepare('INSERT INTO users (username, password, name, role, permissions, access_type) VALUES (?, ?, ?, ?, ?, ?)').run(
        'varsity_user', hashedPass, 'Varsity Student', 'user', 'varsity,routine,blog', 'view'
    );
}

// --- API ROUTES ---

// Login API
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ success: false, error: 'Invalid username or password!' });
        }

        req.session.userId = user.id;
        req.session.role = user.role;

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                permissions: user.permissions,
                access_type: user.access_type
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
});

// Get Workspace Data
app.get('/api/workspace', (req, res) => {
    try {
        const row = db.prepare('SELECT data FROM workspace WHERE key = ?').get('main_workspace');
        if (row) {
            res.json({ success: true, data: JSON.parse(row.data) });
        } else {
            res.json({ success: true, data: null });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch workspace' });
    }
});

// Save Workspace Data
app.post('/api/workspace', (req, res) => {
    try {
        const { data } = req.body;
        const jsonString = JSON.stringify(data);
        db.prepare('INSERT OR REPLACE INTO workspace (key, data) VALUES (?, ?)').run('main_workspace', jsonString);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to save workspace' });
    }
});

// Admin: Get All Users
app.get('/api/users', (req, res) => {
    try {
        const users = db.prepare('SELECT id, username, name, role, permissions, access_type FROM users').all();
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

// Admin: Update User Permissions & Access
app.post('/api/users/update', (req, res) => {
    try {
        const { username, permissions, access_type } = req.body;
        db.prepare('UPDATE users SET permissions = ?, access_type = ? WHERE username = ?').run(permissions, access_type, username);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update user' });
    }
});

// Admin: Create New User Account
app.post('/api/users/create', (req, res) => {
    try {
        const { username, password, name, permissions, access_type } = req.body;
        const hashedPass = bcrypt.hashSync(password, 10);
        db.prepare('INSERT INTO users (username, password, name, role, permissions, access_type) VALUES (?, ?, ?, ?, ?, ?)').run(
            username, hashedPass, name || username, 'user', permissions || 'varsity', access_type || 'view'
        );
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, error: 'Username already exists or invalid data!' });
    }
});

// Serve React Frontend Build
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
    console.log(`Server running on port ${PORT}`);
});
