const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const restoreUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee-wellness');
        console.log('Connected to MongoDB');

        // Find by ID directly from the log if possible, or broad search
        const user = await User.findOne({ email: /harish/i });
        if (user) {
            console.log(`Found user: ${user.email}. Restoring data...`);
            user.name = 'Harish';
            user.department = 'Technical Work';
            user.phone = '7894563210';
            user.location = 'Salem';
            user.age = 21;
            user.bloodGroup = 'AB+';
            user.gender = 'Male';
            user.salaryPackage = '60000';
            user.maritalStatus = 'Unmarried';
            user.shift = 'Day Shift';
            user.joiningDate = new Date('2005-08-12');

            try {
                await user.save();
                console.log('User restored successfully');
            } catch (saveErr) {
                console.error('SAVE_ERROR:', saveErr.message);
            }
        } else {
            console.log('User Harish not found');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('TOP_LEVEL_ERROR:', err);
    }
};

restoreUser();
