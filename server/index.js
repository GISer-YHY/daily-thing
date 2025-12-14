/**
 * Backend Server for Daily PhD & Sales Tracker
 * 
 * INSTRUCTIONS FOR ALIBABA CLOUD DEPLOYMENT:
 * 1. Ensure MySQL is running and accessible on port 3306.
 * 2. Run `npm install express mysql2 cors dotenv body-parser`
 * 3. Run `node index.js`
 */

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// REVERTED: Using Port 3000 for Node.js server.
// Port 3306 is reserved for the MySQL database itself.
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to communicate
app.use(bodyParser.json());

// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  // SECURITY UPDATE: Do not hardcode real passwords in source code.
  // Use .env file locally. When deploying, set environment variables.
  password: process.env.DB_PASSWORD || 'password', 
  database: process.env.DB_NAME || 'userdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Database Connection Pool
const pool = mysql.createPool(dbConfig);

// Test Database Connection on Startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to MySQL database:', dbConfig.database);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   Please check your MySQL credentials and ensure the database "' + dbConfig.database + '" exists.');
    console.error('   Hint: Make sure you have a .env file with DB_PASSWORD set.');
  }
})();

// API Routes

// GET /api/logs/:date - Retrieve log for a specific date
app.get('/api/logs/:date', async (req, res) => {
  const { date } = req.params;
  
  try {
    // We expect a table named 'daily_logs' with columns 'date' and 'content'
    const [rows] = await pool.query('SELECT content FROM daily_logs WHERE date = ?', [date]);
    
    if (rows.length > 0) {
      res.json(rows[0].content);
    } else {
      res.status(404).json({ message: 'Log not found' });
    }
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// POST /api/logs - Create or Update log
app.post('/api/logs', async (req, res) => {
  const logData = req.body;
  const { date } = logData;

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  try {
    // Upsert (Insert or Update if exists)
    const query = `
      INSERT INTO daily_logs (date, content) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE content = VALUES(content)
    `;
    
    await pool.query(query, [date, JSON.stringify(logData)]);
    
    res.json({ message: 'Log saved successfully' });
  } catch (error) {
    console.error('Database save error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('PhD Tracker API is running on Port ' + PORT);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});