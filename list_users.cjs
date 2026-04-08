const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });
const User = require('./backend/models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find().select('name email role');
        console.log(JSON.stringify(users, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
