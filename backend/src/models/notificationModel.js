const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['sent', 'pending'], 
        default: 'pending' 
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); 

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
