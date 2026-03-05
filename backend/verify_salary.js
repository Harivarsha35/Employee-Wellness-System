const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/User');

const verify = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const user = await User.findOne({});
        if (!user) {
            console.log('No user found');
            process.exit();
        }

        console.log('Found user:', user.email);
        console.log('Current Salary:', user.salaryPackage);

        const newSalary = 'VERIFY_' + Date.now();
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $set: { salaryPackage: newSalary } },
            { new: true }
        );

        console.log('Updated Salary in memory:', updatedUser.salaryPackage);

        const freshUser = await User.findById(user._id);
        console.log('Salary in DB after re-fetch:', freshUser.salaryPackage);

        if (freshUser.salaryPackage === newSalary) {
            console.log('SUCCESS: Mongoose update worked.');
        } else {
            console.log('FAILURE: Mongoose update did not stick.');
        }

        process.exit();
    } catch (err) {
        console.error('Error during verification:', err);
        process.exit(1);
    }
};

verify();
