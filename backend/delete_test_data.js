const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Activity = require('./models/Activity');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const testUser = await User.findOne({ name: 'Emp Test' });
        if (testUser) {
            console.log(`Found user: ${testUser.name} (${testUser._id})`);
            
            // Delete activities
            const activityRes = await Activity.deleteMany({ user: testUser._id });
            console.log(`Deleted ${activityRes.deletedCount} activities.`);
            
            // Delete user
            await User.findByIdAndDelete(testUser._id);
            console.log('User deleted.');
        } else {
            console.log('Emp Test user not found.');
        }
        
        // Also remove any activities with no user reference (optional, but good practice for "empty test logs")
        const orphanedRes = await Activity.deleteMany({ user: { $exists: false } });
        console.log(`Deleted ${orphanedRes.deletedCount} orphaned activities.`);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
