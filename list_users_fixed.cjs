const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: 'c:/Users/hariv/OneDrive/Desktop/web 8/employee-wellness-system/backend/.env' });
const User = require('c:/Users/hariv/OneDrive/Desktop/web 8/employee-wellness-system/backend/models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find().select('name email role').limit(10);
        console.log('--- USERS ---');
        users.forEach(u => console.log(`${u.name} | ${u.email} | ${u.role}`));
        console.log('--- END ---');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
