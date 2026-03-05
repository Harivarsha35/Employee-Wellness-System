const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/User');

const testSave = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ email: 'imayavan@gmail.com' });
        if (user) {
            user.profilePhoto = '/uploads/profiles/test.jpg';
            await user.save();
            console.log('SAVE_SUCCESSFUL');

            // Re-verify
            const updated = await User.findById(user._id);
            console.log('NEW_PROFILE_PHOTO:', updated.profilePhoto);
        } else {
            console.log('USER_NOT_FOUND');
        }
        process.exit();
    } catch (err) {
        console.error('SAVE_FAILED:', err.message);
        process.exit(1);
    }
};

testSave();
