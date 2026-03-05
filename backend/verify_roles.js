
const http = require('http');

const runTest = async () => {
    const timestamp = Date.now();
    const email = `test.admin.${timestamp}@example.com`;
    const password = 'password123';

    console.log(`Testing with email: ${email}`);

    // Helper for making requests
    const request = (path, method, data) => {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 5000,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
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
        // 1. Register as Admin
        console.log('\n--- 1. Registering as Admin ---');
        const registerData = {
            name: 'Test Admin',
            email: email,
            password: password,
            phone: '1234567890',
            age: 30,
            gender: 'Male',
            department: 'IT',
            role: 'Admin'
        };
        const registerRes = await request('/api/users', 'POST', registerData);

        if (registerRes.error) {
            console.error('Registration failed:', registerRes.error);
            return;
        }

        if (registerRes.data.role !== 'Admin') {
            console.error('FAILED: Role was not saved as Admin. Got:', registerRes.data.role || 'undefined');
            console.log('The server might be running old code. Please restart the backend.');
        } else {
            console.log('SUCCESS: Registered with role Admin');
        }

        // 2. Login as Admin with correct role
        console.log('\n--- 2. Login as Admin (Correct Role) ---');
        const loginRight = await request('/api/users/login', 'POST', {
            email,
            password,
            role: 'Admin'
        });

        if (loginRight.status === 200 && loginRight.data.role === 'Admin') {
            console.log('SUCCESS: Logged in as Admin');
        } else {
            console.error('FAILED: Could not login as Admin. Status:', loginRight.status, loginRight.error);
        }

        // 3. Login as Admin with WRONG role (Employee)
        console.log('\n--- 3. Login as Admin (Wrong Role - Employee) ---');
        const loginWrong = await request('/api/users/login', 'POST', {
            email,
            password,
            role: 'Employee'
        });

        if (loginWrong.status === 401) {
            console.log('SUCCESS: Login blocked for wrong role (401)');
        } else {
            console.error('FAILED: Should have blocked login. Status:', loginWrong.status);
        }

    } catch (err) {
        console.error('Test script error:', err.message);
        console.log('Is the backend server running on port 5000?');
    }
};

runTest();
