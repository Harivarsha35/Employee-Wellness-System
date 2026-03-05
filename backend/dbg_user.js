const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/User');

const dbg = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee-wellness');
        console.log('Connected to DB');

        const user = await User.findOne({ email: /@example.com/ });
        if (user) {
            console.log('Found user:', user.email);
            console.log('Old Salary:', user.salaryPackage);

            user.salaryPackage = 'TEST PACKAGE ' + Date.now();
            await user.save();

            const updatedUser = await User.findById(user._id);
            console.log('New Salary from DB:', updatedUser.salaryPackage);
        } else {
            console.log('No user found');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

dbg();
