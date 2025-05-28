import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending'
        },
        createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Connection', connectionSchema);