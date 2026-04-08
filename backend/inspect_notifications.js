const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User'); // Load User first
const Notification = require('./models/Notification');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('--- NOTIFICATIONS ---');
        const notifs = await Notification.find().populate('sender', 'name').populate('recipient', 'name');
        notifs.forEach(n => {
            console.log(`ID: ${n._id} | From: ${n.sender?.name || 'Unknown'} | To: ${n.recipient?.name || 'Unknown'} | Msg: ${n.message} | IsRead: ${n.isRead}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
};

run();
