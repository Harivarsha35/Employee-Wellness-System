const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Activity = require('./models/Activity');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('--- ALL ACTIVITIES ---');
        const activities = await Activity.find().populate('user', 'name');
        activities.forEach(a => {
            console.log(`ID: ${a._id} | User: ${a.user ? a.user.name : 'Unknown'} | Exercise: ${a.exerciseType} | Date: ${a.date}`);
        });
        
        console.log('\n--- USERS ---');
        const users = await User.find();
        users.forEach(u => {
            console.log(`ID: ${u._id} | Name: ${u.name} | Role: ${u.role}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
