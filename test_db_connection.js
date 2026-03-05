const mongoose = require('mongoose')
const uri = process.argv[2] || 'mongodb://127.0.0.1:27017/test-db';

console.log(`Testing connection to: ${uri}`);

mongoose.connect(uri)
    .then(() => {
        console.log('✅ SUCCESS: Connected to MongoDB successfully!');
        console.log('You can use this connection string in your .env file.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ FAILURE: Could not connect to MongoDB.');
        console.error('Error details:', err.message);
        console.log('\nTroubleshooting tips:');
        console.log('1. If local: Is the "mongod" server running?');
        console.log('2. If Atlas: Is your IP whitelisted? Is the username/password correct?');
        process.exit(1);
    });
