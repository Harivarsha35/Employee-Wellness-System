const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/User');

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'email role');
        console.log('USER_LIST_START');
        users.forEach(u => console.log(`${u.email}|${u.role}`));
        console.log('USER_LIST_END');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listUsers();
