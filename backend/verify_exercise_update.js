
async function test() {
    const API_URL = 'http://localhost:5000/api';

    const post = async (url, data, token) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        try {
            const res = await fetch(`${API_URL}${url}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            });
            const dataCb = await res.json();
            return { status: res.status, data: dataCb };
        } catch (e) {
            console.error("Fetch error:", e);
            throw e;
        }
    }

    try {
        const email = `exTest${Date.now()}@test.com`;
        console.log(`Registering ${email}...`);
        const reg = await post('/users', {
            name: 'Exercise Tester',
            email,
            password: 'password123',
            dept: 'Testing'
        });

        if (!reg.data || !reg.data.token) {
            console.error('Registration failed:', reg);
            return;
        }
        const token = reg.data.token;

        console.log('Creating activity with exerciseType and Duration...');
        const act = await post('/activities', {
            exerciseType: 'Gym',
            exerciseDuration: 45,
            waterIntake: 3,
            sleepHours: 7,
            stressLevel: 4,
            dietPlan: 'Vegan',
            notes: 'Feeling strong.'
        }, token);

        console.log('Activity Response:', act.data);

        let passed = true;
        if (act.data.exerciseType !== 'Gym') {
            console.error('FAILED: exerciseType mismatch');
            passed = false;
        }
        if (act.data.exerciseDuration !== 45) {
            console.error('FAILED: exerciseDuration mismatch. Expected 45, got', act.data.exerciseDuration);
            passed = false;
        }
        if (act.data.exerciseTime !== undefined) {
            // It might be undefined or not present in JSON, checks if it was returned
            console.log('NOTE: exerciseTime is present in response (might be default or undefined).');
        }

        if (passed) {
            console.log('VERIFICATION PASSED: New fields are correct.');
        } else {
            console.error('VERIFICATION FAILED.');
        }

    } catch (e) {
        console.error('Test Error:', e);
    }
}

test();
