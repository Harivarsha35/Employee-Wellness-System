const axios = require('axios');
const API_URL = 'http://localhost:5000/api/users'
const user = {
    name: 'Debug User',
    email: `debug_${Date.now()}@example.com`,
    password: 'password123',
    phone: '1234567890',
    age: 30,
    gender: 'Male',
    department: 'Engineering'
};

const updateData = {
    phone: '0987654321',
    age: 31,
    gender: 'Male',
    department: 'Engineering Updated'
};

async function testProfileUpdate() {
    try {
        console.log('1. Registering new user...');
        const regRes = await axios.post(API_URL, user);
        console.log('User registered:', regRes.data.email);

        const token = regRes.data.token;
        console.log('Token received.');

        console.log('2. Attempting to update profile...');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        const updateRes = await axios.put(`${API_URL}/profile`, updateData, config);
        console.log('Update Successful!', updateRes.data);

    } catch (error) {
        console.error('Test Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.log('Data (first 500 chars):', error.response.data.toString().substring(0, 500));
        } else {
            console.error('Error:', error.message);
        }
    }
}
testProfileUpdate();