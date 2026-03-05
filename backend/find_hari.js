const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/User');

const findUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'hari35varsha@gmail.com' });
        if (user) {
            console.log('USER_FOUND:', user.email, 'Role:', user.role);
        } else {
            console.log('USER_NOT_FOUND:', 'hari35varsha@gmail.com');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findUser();
