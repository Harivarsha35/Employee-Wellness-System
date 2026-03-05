const mongoose = require('mongoose');
const Activity = require('./models/Activity');
const User = require('./models/User');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const checkData = async () => {
    await connectDB();

    const activities = await Activity.find().populate('user', 'name');
    console.log(`Found ${activities.length} activities.`);

    let orphanedCount = 0;
    activities.forEach(activity => {
        if (!activity.user) {
            orphanedCount++;
            console.log(`Orphaned Activity ID: ${activity._id}, User ID in DB: ${activity.user} (should be null if populated and missing)`);
        } else {
            console.log(`Valid Activity: ${activity._id}, User: ${activity.user.name}`);
        }
    });

    console.log(`Total orphaned activities: ${orphanedCount}`);
    process.exit();
};

checkData();
