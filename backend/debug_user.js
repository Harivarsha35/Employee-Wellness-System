const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/User');

const checkUser = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const user = await User.findOne({ email: 'yash@gmail.com' });
        if (user) {
            console.log('User found:', user);
        } else {
            console.log('User NOT found with email yash@gmail.com');
            const allUsers = await User.find({});
            console.log('All users:', allUsers.map(u => ({ email: u.email, role: u.role, name: u.name })));
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
