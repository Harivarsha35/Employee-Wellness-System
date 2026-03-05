const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const setBMI = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ name: /Imayavan/i });

        if (user) {
            user.bmi = 13.3;
            user.bmiCategory = 'Underweight';
            await user.save();
            console.log('BMI set for Imayavan:', user.name);
        } else {
            console.log('User Imayavan not found.');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

setBMI();
