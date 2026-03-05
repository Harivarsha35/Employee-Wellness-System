const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/User');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ email: 'imayavan@gmail.com' });
        if (user) {
            console.log('USER_FOUND:', user.name);
            console.log('PROFILE_PHOTO:', user.profilePhoto);
            console.log('BLOOD_GROUP:', user.bloodGroup);
        } else {
            console.log('USER_NOT_FOUND');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
