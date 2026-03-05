const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/User');

const resetPass = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'harish@gmail.com' });
        if (user) {
            user.password = '1234';
            await user.save();
            console.log('PASSWORD_RESET_SUCCESSFUL_FOR_HARISH');
        } else {
            console.log('USER_NOT_FOUND');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPass();
