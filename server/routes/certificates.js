const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = "clientproject-certificates";

// Get certificate by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const params = {
            TableName: TABLE_NAME,
            Key: {
                certificateId: id
            }
        };

        const { Item } = await db.send(new GetCommand(params));
        
        if (Item) {
            res.json({ success: true, data: Item });
        } else {
            res.status(404).json({ success: false, message: "Certificate not found or invalid." });
        }
    } catch (error) {
        console.error("Error fetching certificate:", error);
        res.status(500).json({ success: false, message: "Server error while verifying certificate." });
    }
});

// Create a new certificate (for admin/testing)
router.post('/', async (req, res) => {
    try {
        const { certificateId, name, course, issueDate } = req.body;
        
        if (!certificateId || !name || !course) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const params = {
            TableName: TABLE_NAME,
            Item: {
                certificateId,
                name,
                course,
                issueDate: issueDate || new Date().toISOString(),
                createdAt: new Date().toISOString()
            }
        };

        await db.send(new PutCommand(params));
        res.json({ success: true, message: "Certificate added successfully", data: params.Item });
    } catch (error) {
        console.error("Error creating certificate:", error);
        res.status(500).json({ success: false, message: "Server error while creating certificate." });
    }
});

module.exports = router;
