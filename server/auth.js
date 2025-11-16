const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
  
  const hash = bcrypt.hashSync(password, 8);
  db.run('INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)', [name, email, hash, role], function (err) {
    if (err) return res.status(400).json({ error: 'Email already in use or database error' });
    const user = { id: this.lastID, name, email, role };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err || !row) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, row.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  });
});

module.exports = router;
