const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Notification = require('./models/Notification');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const res = await Notification.deleteMany({ message: /Test message/i });
        console.log(`Deleted ${res.deletedCount} test notifications.`);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

run();
