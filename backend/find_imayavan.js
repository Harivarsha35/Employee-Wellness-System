const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const findImayavan = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ name: /Imayavan/i });

        if (users.length > 0) {
            users.forEach(user => {
                console.log('User found:', user.name, '(', user.email, ')');
                console.log('BMI:', user.bmi);
                console.log('BMI Category:', user.bmiCategory);
                console.log('---');
            });
        } else {
            console.log('No user found matching Imayavan.');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findImayavan();
