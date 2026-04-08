const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('Error: MONGO_URI not found in .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

const commands = {
    find: async (query) => {
        if (!query) return console.log('Please provide a name or email to search.');
        const users = await User.find({
            $or: [
                { name: new RegExp(query, 'i') },
                { email: new RegExp(query, 'i') }
            ]
        });
        console.log(`\nFound ${users.length} user(s):`);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) | Role: ${u.role} | Dept: ${u.department || 'N/A'}`);
            console.log(`  BMI: ${u.bmi || 'N/A'} (${u.bmiCategory || 'N/A'}) | Leaves: ${u.totalLeaves}`);
        });
    },

    list: async () => {
        const users = await User.find().select('name email role department');
        console.log('\n--- Employee List ---');
        users.forEach(u => console.log(`${u.role.padEnd(8)} | ${u.name.padEnd(20)} | ${u.email}`));
    },

    'fix-pass': async (email, newPass) => {
        if (!email || !newPass) return console.log('Usage: fix-pass <email> <newPassword>');
        const user = await User.findOne({ email });
        if (!user) return console.log('User not found.');
        
        user.password = newPass; // Presave hook handles hashing
        await user.save();
        console.log(`Password updated successfully for ${email}`);
    },

    'check-wellness': async (email) => {
        if (!email) return console.log('Please provide an email.');
        const user = await User.findOne({ email });
        if (!user) return console.log('User not found.');

        const activities = await Activity.find({ user: user._id }).sort({ date: -1 }).limit(5);
        console.log(`\nWellness Check for ${user.name}:`);
        console.log(`Last 5 Activities:`);
        activities.forEach(a => {
            console.log(`- ${a.date.toISOString().split('T')[0]}: Water: ${a.waterIntake}L, Sleep: ${a.sleepHours}h, Stress: ${a.stressLevel}`);
        });
    },

    'fix-leaves': async (email, count) => {
        if (!email || count === undefined) return console.log('Usage: fix-leaves <email> <count>');
        const user = await User.findOne({ email });
        if (!user) return console.log('User not found.');

        user.totalLeaves = parseInt(count);
        await user.save();
        console.log(`Total leaves updated to ${count} for ${email}`);
    },

    'cleanup-orphans': async () => {
        const activities = await Activity.find();
        let removed = 0;
        for (const act of activities) {
            const userExists = await User.exists({ _id: act.user });
            if (!userExists) {
                await Activity.findByIdAndDelete(act._id);
                removed++;
            }
        }
        console.log(`Cleaned up ${removed} orphaned activities.`);
    }
};

const run = async () => {
    const [,, cmd, arg1, arg2] = process.argv;

    if (!cmd || cmd === '--help' || cmd === '-h') {
        console.log(`
Usage: node scripts/db_manager.js <command> [args]

Commands:
  find <name/email>      Search for users
  list                   List all users
  fix-pass <email> <p>   Update user password
  fix-leaves <email> <n> Update total leaves
  check-wellness <email> Show recent wellness logs
  cleanup-orphans        Remove activities with no user
        `);
        return;
    }

    await connectDB();

    if (commands[cmd]) {
        await commands[cmd](arg1, arg2);
    } else {
        console.log(`Unknown command: ${cmd}`);
    }

    mongoose.disconnect();
};

run();
