const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both Admin ID and password.' });
    }

    const identifier = (email || '').trim().toLowerCase();

    // Strict restriction: Only rushi@8001 is authorized to log in
    if (identifier !== 'rushi@8001') {
      return res.status(401).json({ success: false, message: 'Invalid Admin ID. Access denied.' });
    }

    const admins = db.getAdmins();
    const admin = admins.find(a =>
      (a.email && a.email.toLowerCase() === identifier) ||
      (a.username && a.username.toLowerCase() === identifier) ||
      (a.id && a.id.toLowerCase() === identifier)
    );

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid Admin ID or credentials.' });
    }

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password credentials.' });
    }

    const payload = { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during authentication.', error: err.message });
  }
};

exports.getMe = (req, res) => {
  return res.json({ success: true, admin: req.admin });
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const admins = db.getAdmins();
    const admin = admins.find(a => a.id === req.admin.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });

    const isMatch = bcrypt.compareSync(currentPassword, admin.passwordHash);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password.' });

    admin.passwordHash = bcrypt.hashSync(newPassword, 10);
    admin.updatedAt = new Date().toISOString();

    // Save back to data.json
    const fs = require('fs'), path = require('path');
    const dbFile = path.join(__dirname, '../database/data.json');
    let data = {};
    try { data = JSON.parse(fs.readFileSync(dbFile, 'utf-8')); } catch (e) { data = { admins: [] }; }
    const idx = (data.admins || []).findIndex(a => a.id === req.admin.id);
    if (idx !== -1) data.admins[idx] = admin;
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
