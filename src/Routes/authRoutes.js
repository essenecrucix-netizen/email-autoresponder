const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const DatabaseService = require('../services/database/DatabaseService');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-very-secure-secret';

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const database = DatabaseService();
        const user = await database.getItemByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ user: { ...user, password_hash: undefined }, token });
    } catch (error) {
        console.error('Error during login:', error.message, error.stack);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    try {
        const database = DatabaseService();
        const existingUser = await database.getItemByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            email,
            name,
            password_hash: hashedPassword,
            role: role || 'user',
            created_at: new Date().toISOString(),
        };

        await database.createItem('users', newUser);
        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        console.error('Error during signup:', error.message, error.stack);
        res.status(500).json({ error: 'An error occurred during signup.' });
    }
});

module.exports = router;
