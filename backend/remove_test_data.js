const mongoose = require('mongoose');
const User = require('./models/User');
const Activity = require('./models/Activity');
require('dotenv').config();

const removeTestData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find users with @example.com in their email
        const testUserEmails = await User.find({ email: /@example\.com$/i }, '_id email');
        const testUserIds = testUserEmails.map(user => user._id);

        console.log(`Found ${testUserIds.length} test users.`);

        if (testUserIds.length > 0) {
            // Delete activities for these users
            const activityResult = await Activity.deleteMany({ user: { $in: testUserIds } });
            console.log(`Deleted ${activityResult.deletedCount} activities related to test users.`);

            // Delete the users
            const userResult = await User.deleteMany({ _id: { $in: testUserIds } });
            console.log(`Deleted ${userResult.deletedCount} test users.`);
        }

        // Final cleanup of any orphaned activities (just in case)
        const allActivities = await Activity.find().populate('user');
        const orphans = allActivities.filter(a => !a.user).map(a => a._id);
        if (orphans.length > 0) {
            const orphanResult = await Activity.deleteMany({ _id: { $in: orphans } });
            console.log(`Deleted ${orphanResult.deletedCount} extra orphaned activities.`);
        } else {
            console.log('No extra orphaned activities found.');
        }

        console.log('Cleanup complete!');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
};

removeTestData();
