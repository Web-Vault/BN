import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import users from '../models/users.js';
import connection from '../models/connection.js';

const router = express.Router();

// Send connection request
router.post('/request', protect, async (req, res) => {
        try {
                const { receiverId } = req.body;

                const existingConnection = await connection.findOne({
                        $or: [
                                { sender: req.user.id, receiver: receiverId },
                                { sender: receiverId, receiver: req.user.id }
                        ]
                });

                if (existingConnection) return res.status(400).json({ msg: 'Connection request already exists' });

                const newConnection = new connection({
                        sender: req.user.id,
                        receiver: receiverId
                });

                await newConnection.save();
                res.json(newConnection);
        } catch (err) {
                res.status(500).send('Server Error');
        }
});

// Get all connection requests
router.get('/requests', protect, async (req, res) => {
        try {
                const requests = await connection.find({
                        $or: [
                                { receiver: req.user.id, status: 'pending' },
                                { sender: req.user.id, status: 'pending' }
                        ]
                })
                        .populate('sender', 'userName userEmail')
                        .populate('receiver', 'userName userEmail');

                res.json(requests);
        } catch (err) {
                res.status(500).send('Server Error');
        }
});

// Accept connection request
router.put('/requests/:id/accept', protect, async (req, res) => {
        try {
                const connectionRequest = await connection.findById(req.params.id);

                // Check if connection request exists and belongs to the user
                if (!connectionRequest || connectionRequest.receiver.toString() !== req.user.id) {
                        return res.status(404).json({ msg: 'Request not found' });
                }

                // Update status to 'accepted'
                connectionRequest.status = 'accepted';
                await connectionRequest.save();

                const senderId = connectionRequest.sender;
                const receiverId = connectionRequest.receiver;

                // Add sender to receiver's connections
                const receiverUpdate = await users.findByIdAndUpdate(
                        receiverId,
                        { $addToSet: { connections: senderId } },
                        { new: true }
                );

                // Add receiver to sender's connections
                const senderUpdate = await users.findByIdAndUpdate(
                        senderId,
                        { $addToSet: { connections: receiverId } },
                        { new: true }
                );

                // Optional: Log the updated users for debugging
                // console.log("✅ Receiver updated:", receiverUpdate);
                // console.log("✅ Sender updated:", senderUpdate);

                res.status(200).json({ msg: 'Connection accepted', updatedConnection: connectionRequest });
        } catch (err) {
                console.error("❌ Server Error:", err);
                res.status(500).send('Server Error');
        }
});


// Reject connection request
router.put('/requests/:id/reject', protect, async (req, res) => {
        try {
                const connection = await connection.findByIdAndDelete(req.params.id);
                res.json({ msg: 'Request rejected' });
        } catch (err) {
                res.status(500).send('Server Error');
        }
});

// Get all connections
router.get('/', protect, async (req, res) => {
        try {
                const user = await users.findById(req.user.id).populate('connections', 'userName userEmail');
                res.json(user.connections);
        } catch (err) {
                res.status(500).send('Server Error');
        }
});

router.get('/status/:userId', protect, async (req, res) => {
        try {
                const existingConnection = await connection.findOne({
                        $or: [
                                { sender: req.user.id, receiver: req.params.userId },
                                { sender: req.params.userId, receiver: req.user.id }
                        ]
                });
                res.json({ status: existingConnection?.status || 'not-connected' });
        } catch (err) {
                res.status(500).send('Server Error');
        }
});

// Add to connectionRoutes.js
router.delete('/:userId', protect, async (req, res) => {
        try {
                await connection.findOneAndDelete({
                        $or: [
                                { sender: req.user.id, receiver: req.params.userId },
                                { sender: req.params.userId, receiver: req.user.id }
                        ]
                });

                await users.findByIdAndUpdate(req.user.id, {
                        $pull: { connections: req.params.userId }
                });

                await users.findByIdAndUpdate(req.params.userId, {
                        $pull: { connections: req.user.id }
                });

                res.json({ msg: 'Connection removed' });
        } catch (err) {
                res.status(500).send('Server Error');
        }
});

router.get('/status/:userId', protect, async (req, res) => {
        try {
                const existingConnection = await connection.findOne({
                        $or: [
                                { sender: req.user.id, receiver: req.params.userId },
                                { sender: req.params.userId, receiver: req.user.id }
                        ]
                });

                res.json({
                        status: existingConnection?.status || 'not-connected',
                        connectionId: existingConnection?._id
                });
        } catch (err) {
                res.status(500).send('Server Error');
        }
});

export default router;
