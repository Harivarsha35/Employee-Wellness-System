const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const restoreUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee-wellness');
        console.log('Connected to MongoDB');

        const result = await User.updateOne(
            { email: /harish/i },
            {
                $set: {
                    name: 'Harish',
                    department: 'Technical Work',
                    phone: '7894563210',
                    location: 'Salem',
                    age: 21,
                    bloodGroup: 'AB+',
                    gender: 'Male',
                    salaryPackage: '60000',
                    maritalStatus: 'Unmarried',
                    shift: 'Day Shift',
                    joiningDate: new Date('2005-08-12')
                }
            }
        );

        console.log('Update result:', result);

        await mongoose.connection.close();
    } catch (err) {
        console.error('ERROR:', err);
    }
};

restoreUser();
