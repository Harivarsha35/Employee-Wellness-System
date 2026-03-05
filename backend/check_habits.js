const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee-wellness');
        console.log('Connected to MongoDB');

        const user = await User.findOne({});
        if (user) {
            console.log(`Updating user: ${user.email}`);
            user.smokingHabit = 'Yes';
            user.alcoholConsumption = 'No';
            try {
                await user.save();
                console.log('User saved successfully');
            } catch (saveErr) {
                console.error('SAVE_ERROR:', saveErr.message);
                if (saveErr.errors) {
                    Object.keys(saveErr.errors).forEach(key => {
                        console.error(`- Field ${key}: ${saveErr.errors[key].message}`);
                    });
                }
            }

            const updatedUser = await User.findById(user._id);
            console.log('Verification:');
            console.log(`- smokingHabit: ${updatedUser.smokingHabit}`);
            console.log(`- alcoholConsumption: ${updatedUser.alcoholConsumption}`);
        } else {
            console.log('No users found');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('TOP_LEVEL_ERROR:', err);
    }
};

checkUser();
