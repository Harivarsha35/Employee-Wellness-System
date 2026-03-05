const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/User');

const resetPass = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'hari@gmail.com' });
        if (user) {
            user.password = '123'; // Setting it to 123 as requested or common
            await user.save();
            console.log('PASSWORD_RESET_SUCCESSFUL_FOR_HARI');
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
