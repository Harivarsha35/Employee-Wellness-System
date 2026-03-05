const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'hari35varsha@gmail.com';
        let user = await User.findOne({ email });

        if (user) {
            console.log('User found:', user.name);
            user.password = 'password123';
            await user.save();
            console.log('Password reset to: password123');
        } else {
            console.log('User not found. Creating user...');
            user = await User.create({
                name: 'Hari Varsha',
                email: email,
                password: 'password123',
                phone: '1234567890',
                age: 25,
                gender: 'Female',
                department: 'Engineering'
            });
            console.log('User created with password: password123');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
