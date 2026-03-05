
async function test() {
    const API_URL = 'http://localhost:5000/api';

    // Helper for requests
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
        const email = `noteTest${Date.now()}@test.com`;
        console.log(`Registering ${email}...`);
        const reg = await post('/users', {
            name: 'Note Tester',
            email,
            password: 'password123',
            dept: 'Testing'
        });

        if (!reg.data || !reg.data.token) {
            console.error('Registration failed:', reg);
            return;
        }
        const token = reg.data.token;

        console.log('Creating activity with notes...');
        const act = await post('/activities', {
            exerciseTime: 60,
            waterIntake: 3,
            sleepHours: 7,
            stressLevel: 4,
            dietPlan: 'Vegan',
            notes: 'This is a test note.'
        }, token);

        console.log('Activity Response:', act.data);

        if (act.data.notes === 'This is a test note.') {
            console.log('VERIFICATION PASSED: Notes field is present and correct.');
        } else {
            console.error('VERIFICATION FAILED: Notes field mismatch.', act.data);
        }

    } catch (e) {
        console.error('Test Error:', e);
    }
}

test();
