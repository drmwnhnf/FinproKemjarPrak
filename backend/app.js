const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

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

// Secret key for JWT
const secret = '2aaaf6b9a1cdacd68faee3bb1a9a8264844c2a5220141874e0c4b91bf1dbe6acbc834923a0a27b4a74dd926b223074f0d59c1fa484b672453c8370a90eac5194';

// Middleware to authenticate using JWT
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(403).send({ message: 'Access denied' });

    jwt.verify(token, secret, (err, user) => {
        if (err) return res.status(403).send({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Register user (without bcrypt)
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
        'SELECT id, password FROM users WHERE username = ?',
        [username],
        (err, row) => {
            if (err) {
                res.status(500).json({ message: 'Database error' });
                console.log(err);
            } else if (row && row.password === password) {
                // Generate JWT
                const token = jwt.sign({ userId: row.id }, secret, { expiresIn: '1h' });
                res.json({ message: 'Login successful', token, userId: row.id }); // Kembalikan token dan userId
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        }
    );
});

// Get diary entries
app.get('/diary/:userId', authenticateToken, (req, res) => {
    const { userId } = req.params;
    db.all('SELECT id, content FROM diary WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Database error' });
            console.log(err);
        } else {
            res.json(rows);
        }
    });
});

// Add diary entry
app.post('/diary', authenticateToken, (req, res) => {
    const { userId, content } = req.body;
    db.run('INSERT INTO diary (user_id, content) VALUES (?, ?)', [userId, content], function (err) {
        if (err) {
            res.status(500).json({ message: 'Failed to add diary entry', error: err.message });
            console.log(err);
        } else {
            res.json({ message: 'Diary entry added', entryId: this.lastID });
        }
    });
});

// Delete diary entry
app.delete('/diary/:id', authenticateToken, (req, res) => {
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
app.post('/change-password', authenticateToken, (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    db.get('SELECT password FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            res.status(500).json({ message: 'Database error' });
        } else if (row && row.password === oldPassword) {
            db.run('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId], function (err) {
                if (err) {
                    res.status(500).json({ message: 'Failed to change password', error: err.message });
                } else {
                    res.json({ message: 'Password changed successfully' });
                }
            });
        } else {
            res.status(400).json({ message: 'Incorrect old password' });
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
