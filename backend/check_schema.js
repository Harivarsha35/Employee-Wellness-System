const mongoose = require('mongoose');
const User = require('./models/User');

console.log('User Schema Paths:');
Object.keys(User.schema.paths).forEach(path => {
    console.log(`- ${path}`);
});
process.exit(0);
