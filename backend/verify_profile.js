const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const timestamp = Date.now();
const userEmail = `profiletest${timestamp}@example.com`;
const userPassword = 'password123';

const run = async () => {
    try {
        console.log('1. Registering new user...');
        const regRes = await axios.post(`${API_URL}/users`, {
            name: 'Original Name',
            email: userEmail,
            password: userPassword,
            phone: '1111111111',
            age: 20,
            gender: 'Male',
            department: 'Test Dept',
            role: 'Employee',
            maritalStatus: 'Unmarried',
            shift: 'Day Shift',
            location: 'New York'
        });
        console.log('Registration OK. ID:', regRes.data._id);

        console.log('2. Logging in...');
        const loginRes = await axios.post(`${API_URL}/users/login`, {
            email: userEmail,
            password: userPassword
        });
        const token = loginRes.data.token;
        console.log('Login OK. Token obtained.');

        console.log('3. Updating Profile...');
        const updateData = {
            name: 'Updated Name',
            email: userEmail,
            phone: '9999999999',
            age: 21,
            gender: 'Male',
            department: 'Updated Dept',
            maritalStatus: 'Married',
            shift: 'Night Shift',
            location: 'Test City'
        };

        const updateRes = await axios.put(`${API_URL}/users/profile`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Update Response:', updateRes.data);

        console.log('4. Verifying Persistence...');
        const meRes = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const u = meRes.data;
        if (u.name === 'Updated Name' && u.maritalStatus === 'Married' && u.location === 'Test City') {
            console.log('SUCCESS: Profile updated and persisted correctly.');
        } else {
            console.log('FAILED: Validation mismatch.');
            console.log('Expected: Updated Name/Married/Test City');
            console.log('Got:', u.name, u.maritalStatus, u.location);
        }

    } catch (err) {
        console.error('ERROR:', err.response ? err.response.data : err.message);
    }
};

run();
