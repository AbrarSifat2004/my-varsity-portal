const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 1. CONNECT TO PERMANENT MONGODB CLOUD DATABASE ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://<db_username>:od2o7t6BVd6QAu3e@varsityportalcluster.ulslhvl.mongodb.net/";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to Permanent Cloud Database (MongoDB)');
    await seedDefaultUsers();
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 2. DATABASE SCHEMAS ---
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, default: 'user' },
  permissions: { type: String, default: 'varsity' },
  access_type: { type: String, default: 'view' }
});

const workspaceSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'main_workspace' },
  data: { type: Object, required: true }
});

const User = mongoose.model('User', userSchema);
const Workspace = mongoose.model('Workspace', workspaceSchema);

// --- 3. CREATE DEFAULT ADMIN & STUDENT ACCOUNTS ---
async function seedDefaultUsers() {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const adminHash = bcrypt.hashSync('admin123', 10);
      await User.create({
        username: 'admin',
        password: adminHash,
        name: 'Master Admin',
        role: 'admin',
        permissions: 'all',
        access_type: 'edit'
      });
    }

    const studentExists = await User.findOne({ username: 'varsity_user' });
    if (!studentExists) {
      const userHash = bcrypt.hashSync('user123', 10);
      await User.create({
        username: 'varsity_user',
        password: userHash,
        name: 'Varsity Student',
        role: 'user',
        permissions: 'varsity,routine,blog',
        access_type: 'view'
      });
    }
  } catch (e) {
    console.error("Seed error:", e);
  }
}

// --- 4. API ROUTES ---

// Login API
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, error: 'Invalid username or password!' });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
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
app.get('/api/workspace', async (req, res) => {
  try {
    const record = await Workspace.findOne({ key: 'main_workspace' });
    res.json({ success: true, data: record ? record.data : null });
  } catch (err) {
    res.json({ success: false, data: null });
  }
});

// Save Workspace Data
app.post('/api/workspace', async (req, res) => {
  try {
    const { data } = req.body;
    await Workspace.findOneAndUpdate(
      { key: 'main_workspace' },
      { data },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save workspace' });
  }
});

// Admin: Get All Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    const formatted = users.map(u => ({
      id: u._id,
      username: u.username,
      name: u.name,
      role: u.role,
      permissions: u.permissions,
      access_type: u.access_type
    }));
    res.json({ success: true, users: formatted });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Admin: Update User Permissions & Access Type
app.post('/api/users/update', async (req, res) => {
  try {
    const { username, permissions, access_type } = req.body;
    await User.findOneAndUpdate({ username }, { permissions, access_type });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Admin: Create New Student / User Account
app.post('/api/users/create', async (req, res) => {
  try {
    const { username, password, name, permissions, access_type } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    await User.create({
      username,
      password: hash,
      name: name || username,
      role: 'user',
      permissions: permissions || 'varsity',
      access_type: access_type || 'view'
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Username already exists!' });
  }
});

// --- 5. SERVE REACT FRONTEND BUILD FOR ONLINE DEPLOYMENT ---
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