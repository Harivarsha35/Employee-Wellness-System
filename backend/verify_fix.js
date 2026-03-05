const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const timestamp = Date.now();
const userEmail = `newuser${timestamp}@example.com`;
const userPassword = 'password123';

const runVerification = async () => {
    try {
        console.log('Registering new user:', userEmail);
        // 1. Register
        await axios.post(`${API_URL}/users`, {
            name: 'Test Verify User',
            email: userEmail,
            password: userPassword,
            phone: '1234567890',
            age: 25,
            gender: 'Male',
            department: 'IT',
            role: 'Employee',
            maritalStatus: 'Unmarried',
            shift: 'Day Shift',
            location: 'New York'
        });
        console.log('Registration successful');

        // 2. Login
        const loginRes = await axios.post(`${API_URL}/users/login`, {
            email: userEmail,
            password: userPassword
        });
        const token = loginRes.data.token;
        console.log('Login successful');

        // 3. Create activity with specific type
        const newActivity = {
            exerciseType: 'Cycling',
            exerciseDuration: 60,
            waterIntake: 2.5,
            sleepHours: 8,
            stressLevel: 3,
            dietPlan: 'Keto',
            notes: 'Test activity for verification'
        };

        const createRes = await axios.post(`${API_URL}/activities`, newActivity, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Activity created:', createRes.data);

        // 4. Verify First Activity
        if (createRes.data.exerciseType === 'Cycling') {
            console.log('SUCCESS: First Activity saved correctly');
        }

        // 5. Create Second Activity (Newer)
        console.log('Creating second activity...');
        const secondActivity = { ...newActivity, exerciseType: 'Running', notes: 'Newer Activity' };
        const secondRes = await axios.post(`${API_URL}/activities`, secondActivity, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 6. Verify Sorting
        const listRes = await axios.get(`${API_URL}/activities`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (listRes.data.length >= 2 && listRes.data[0]._id === secondRes.data._id) {
            console.log('SUCCESS: Second (newer) activity is at the top of the list.');
        } else {
            console.log('FAILED: Sorting incorrect. Top item:', listRes.data[0]?._id, 'Expected:', secondRes.data._id);
            console.log('List order:', listRes.data.map(a => `${a.exerciseType} (${a.notes})`));
        }

    } catch (err) {
        console.error('Verification Failed:', err.response ? err.response.data : err.message);
    }
};

runVerification();
