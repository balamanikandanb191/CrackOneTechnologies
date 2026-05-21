const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/db');
const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = "clientproject-users";

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        const { Item } = await db.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId: email }
        }));

        if (!Item) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, Item.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { email: Item.email, role: Item.role },
            process.env.JWT_SECRET || 'demo_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: { token, user: { name: Item.name, email: Item.email, role: Item.role } }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'All fields required' });
        }

        // Check if user exists
        const { Item } = await db.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId: email }
        }));

        if (Item) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                userId: email,
                email: email,
                name,
                password: hashedPassword,
                role: 'admin', // By default, new users here will be admin for simplicity
                createdAt: new Date().toISOString()
            }
        }));

        res.status(201).json({ success: true, message: 'User registered successfully. You can now login.' });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

// Verify token
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_secret_key');
        res.json({ success: true, data: decoded });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

module.exports = router;
