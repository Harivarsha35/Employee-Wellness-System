const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/User');

const verifyUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'harish@gmail.com' });
        if (user) {
            console.log('USER_FOUND:');
            console.log('Name:', user.name);
            console.log('Role:', user.role);
            console.log('Email:', user.email);
        } else {
            console.log('USER_NOT_FOUND');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyUser();
