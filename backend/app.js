const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Register user
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password],
        function (err) {
            if (err) {
                res.status(500).json({ message: 'Registration failed', error: err.message });
                console.log(err);
            } else {
                res.json({ message: 'User registered successfully', userId: this.lastID });
            }
        }
    );
});

// Login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(
        'SELECT id FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, row) => {
            if (err) {
                res.status(500).json({ message: 'Database error' });
                console.log(err);
            } else if (row) {
                res.json({ message: 'Login successful', userId: row.id });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        }
    );
});

// Get diary entries for a user
app.get('/diary/:userId', (req, res) => {
    const { userId } = req.params;

    db.all(
        'SELECT id, content FROM diary WHERE user_id = ?',
        [userId],
        (err, rows) => {
            if (err) {
                res.status(500).json({ message: 'Database error' });
                console.log(err);
            } else {
                res.json(rows);
            }
        }
    );
});

// Add diary entry
app.post('/diary', (req, res) => {
    const { userId, content } = req.body;

    db.run(
        'INSERT INTO diary (user_id, content) VALUES (?, ?)',
        [userId, content],
        function (err) {
            if (err) {
                res.status(500).json({ message: 'Failed to add diary entry', error: err.message });
                console.log(err);
            } else {
                res.json({ message: 'Diary entry added', entryId: this.lastID });
            }
        }
    );
});

// Delete diary entry
app.delete('/diary/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM diary WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ message: 'Failed to delete diary entry', error: err.message });
            console.log(err);
        } else {
            res.json({ message: 'Diary entry deleted' });
        }
    });
});

// Change password
app.post('/change-password', (req, res) => {
    const { userId, newPassword } = req.body;

    db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [newPassword, userId],
        function (err) {
            if (err) {
                res.status(500).json({ message: 'Failed to change password', error: err.message });
                console.log(err);
            } else if (this.changes > 0) {
                res.json({ message: 'Password changed successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        }
    );
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
