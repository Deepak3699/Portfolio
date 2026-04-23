const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL Pool setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon and other hosted PG services
  }
});

// Initialize Database Table
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('PostgreSQL Table ready.');
  } catch (err) {
    console.error('Error initializing PostgreSQL:', err.message);
  }
};
initDb();

// API Endpoints

// 1. Submit a message
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const query = 'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING *';
    await pool.query(query, [name, email, message]);
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('DB Insert Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

// 2. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const envUsername = process.env.ADMIN_USERNAME || 'admin';
  const envPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === envUsername && password === envPassword) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ success: true, token });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }
});

// 3. Get all messages (Protected)
app.get('/api/admin/messages', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }

    try {
      const query = 'SELECT * FROM messages ORDER BY timestamp DESC';
      const result = await pool.query(query);
      res.status(200).json({ success: true, messages: result.rows });
    } catch (err) {
      console.error('DB Fetch Error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
    }
  });
});

// 4. Delete a message (Protected)
app.delete('/api/admin/messages/:id', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });

  jwt.verify(token, JWT_SECRET, async (err) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token.' });

    const { id } = req.params;
    try {
      await pool.query('DELETE FROM messages WHERE id = $1', [id]);
      res.status(200).json({ success: true, message: 'Message deleted.' });
    } catch (err) {
      console.error('DB Delete Error:', err.message);
      res.status(500).json({ success: false, message: 'Delete failed.' });
    }
  });
});

// Serve frontend for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
