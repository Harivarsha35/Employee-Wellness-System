
const http = require('http');

const runTest = async () => {
    const timestamp = Date.now();
    const email = `test.hr.${timestamp}@example.com`;
    const password = 'password123';

    console.log(`Testing with email: ${email}`);

    // Helper for making requests
    const request = (path, method, data, token) => {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 5000,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
            };

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 400) {
                        try {
                            const parsed = JSON.parse(body);
                            resolve({ status: res.statusCode, error: parsed });
                        } catch (e) {
                            resolve({ status: res.statusCode, error: body });
                        }
                    } else {
                        try {
                            const parsed = JSON.parse(body);
                            resolve({ status: res.statusCode, data: parsed });
                        } catch (e) {
                            resolve({ status: res.statusCode, data: body });
                        }
                    }
                });
            });

            req.on('error', (e) => reject(e));
            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    };

    try {
        // 1. Register as HR
        console.log('\n--- 1. Registering as HR ---');
        const registerData = {
            name: 'Test HR',
            email: email,
            password: password,
            phone: '1234567890',
            age: 35,
            gender: 'Female',
            department: 'HR',
            role: 'HR'
        };
        const registerRes = await request('/api/users', 'POST', registerData);

        if (registerRes.error) {
            console.error('Registration failed:', registerRes.error);
            return;
        }

        const token = registerRes.data.token;
        console.log('SUCCESS: Registered as HR. Token obtained.');

        // 2. Fetch All Users (HR Route)
        console.log('\n--- 2. Fetching All Users (HR Access) ---');
        const usersRes = await request('/api/users', 'GET', null, token);

        if (usersRes.status === 200 && Array.isArray(usersRes.data)) {
            console.log(`SUCCESS: Fetched ${usersRes.data.length} users.`);
        } else {
            console.error('FAILED: Could not fetch users.', usersRes);
        }

        // 3. Fetch All Activities (HR Route)
        console.log('\n--- 3. Fetching All Activities (HR Access) ---');
        const activitiesRes = await request('/api/activities/all', 'GET', null, token);

        if (activitiesRes.status === 200 && Array.isArray(activitiesRes.data)) {
            console.log(`SUCCESS: Fetched ${activitiesRes.data.length} activities.`);
        } else {
            console.error('FAILED: Could not fetch activities.', activitiesRes);
        }

    } catch (err) {
        console.error('Test script error:', err.message);
    }
};

runTest();
