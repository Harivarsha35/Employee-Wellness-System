const mongoose = require('mongoose');
const Activity = require('./models/Activity');
const User = require('./models/User');
require('dotenv').config(); // Load from .env in current dir

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const cleanupData = async () => {
    await connectDB();

    console.log("Checking for orphaned activities...");
    const activities = await Activity.find();

    // We can't use populate here effectively to find *missing* ones easily in one query without filtered populate which might be tricky with just 'find'.
    // Better to fetch all and check manually or use aggregation. 
    // To be safe and simple: fetch all, check if user exists.

    // Actually, populate will return NULL if the referenced document is missing.
    const populatedActivities = await Activity.find().populate('user');

    const orphans = [];
    for (const activity of populatedActivities) {
        if (!activity.user) {
            orphans.push(activity._id);
        }
    }

    console.log(`Found ${orphans.length} orphaned activities.`);

    if (orphans.length > 0) {
        const result = await Activity.deleteMany({ _id: { $in: orphans } });
        console.log(`Deleted ${result.deletedCount} orphaned activities.`);
    } else {
        console.log("No orphaned activities found.");
    }

    process.exit();
};

cleanupData();
