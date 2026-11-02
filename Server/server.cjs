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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'cloud-secret-key-varsity-123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 Days
}));

// Initialize SQLite Tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        name TEXT,
        role TEXT DEFAULT 'user',
        permissions TEXT DEFAULT 'varsity',
        access_type TEXT DEFAULT 'view',
        last_active TEXT DEFAULT 'Never'
    );

    CREATE TABLE IF NOT EXISTS workspace (
        key TEXT PRIMARY KEY,
        data TEXT
    );
`);

// Add last_active column safely if upgrading existing DB
try {
    db.exec(`ALTER TABLE users ADD COLUMN last_active TEXT DEFAULT 'Never'`);
} catch (e) {
    // Column already exists
}

// Seed Default Admin & Student Accounts
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
        'B54SC', hashedPass, 'Varsity Student', 'user', 'varsity,routine,blog', 'view'
    );
}

// --- API ROUTES ---

// 1. Login API (Updates Last Active Timestamp)
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ success: false, error: 'Invalid username or password!' });
        }

        const now = new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });
        db.prepare('UPDATE users SET last_active = ? WHERE id = ?').run(now, user.id);

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
                access_type: user.access_type,
                last_active: now
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
});

// 2. Get Workspace Data
app.get('/api/workspace', (req, res) => {
    try {
        const row = db.prepare('SELECT data FROM workspace WHERE key = ?').get('main_workspace');
        res.json({ success: true, data: row ? JSON.parse(row.data) : null });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch workspace' });
    }
});

// 3. Save Workspace Data
app.post('/api/workspace', (req, res) => {
    try {
        const { data } = req.body;
        db.prepare('INSERT OR REPLACE INTO workspace (key, data) VALUES (?, ?)').run('main_workspace', JSON.stringify(data));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to save workspace' });
    }
});

// 4. Admin: Get All Users
app.get('/api/users', (req, res) => {
    try {
        const users = db.prepare('SELECT id, username, name, role, permissions, access_type, last_active FROM users').all();
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

// 5. Admin: Create New User
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

// 6. Admin: Update Permissions & Access Type
app.post('/api/users/update', (req, res) => {
    try {
        const { username, permissions, access_type } = req.body;
        db.prepare('UPDATE users SET permissions = ?, access_type = ? WHERE username = ?').run(permissions, access_type, username);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update user' });
    }
});

// 7. Admin: Reset User Password
app.post('/api/users/reset-password', (req, res) => {
    try {
        const { username, newPassword } = req.body;
        const hashedPass = bcrypt.hashSync(newPassword, 10);
        db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hashedPass, username);
        res.json({ success: true, message: 'Password updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to reset password' });
    }
});

// 8. Admin: Delete User Account
app.delete('/api/users/:username', (req, res) => {
    try {
        const { username } = req.params;
        if (username === 'admin') {
            return res.status(400).json({ success: false, error: 'Master Admin cannot be deleted!' });
        }
        db.prepare('DELETE FROM users WHERE username = ?').run(username);
        res.json({ success: true, message: 'User deleted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete user' });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});