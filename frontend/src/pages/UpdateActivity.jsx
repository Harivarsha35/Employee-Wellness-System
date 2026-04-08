import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const UpdateActivity = () => {
    const [formData, setFormData] = useState({
        exerciseType: 'Other',
        exerciseDuration: '',
        waterIntake: '',
        sleepHours: '',
        stressLevel: 0,
        dietPlan: 'Balanced',
        workLocation: 'Onsite',
        employmentType: 'Full Time',
        isLeave: false,
        notes: ''
    });
    const [alreadyLogged, setAlreadyLogged] = useState(false);
    const [checking, setChecking] = useState(true);
    const navigate = useNavigate();

    // Check on load if employee already logged activity today
    useEffect(() => {
        const checkToday = async () => {
            try {
                const res = await api.get('/activities');
                const today = new Date().toDateString();
                const loggedToday = res.data.some(
                    a => new Date(a.createdAt).toDateString() === today
                );
                setAlreadyLogged(loggedToday);
            } catch (err) {
                console.error('Could not check today activity:', err);
            } finally {
                setChecking(false);
            }
        };
        checkToday();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/activities', formData);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to update activity';
            alert(msg);
        }
    };

    if (checking) return (
        <div className="container" style={{ maxWidth: '500px', textAlign: 'center', marginTop: '60px' }}>
            <p>Checking today's log...</p>
        </div>
    );

    if (alreadyLogged) return (
        <div className="container" style={{ maxWidth: '500px' }}>
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>✅</div>
                <h2 style={{ color: '#27ae60', marginBottom: '10px' }}>Already Logged Today!</h2>
                <p style={{ color: '#666', marginBottom: '25px' }}>
                    You have already submitted your activity for <strong>{new Date().toLocaleDateString()}</strong>.<br />
                    Come back tomorrow to log your next activity.
                </p>
                <button className="btn" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '500px' }}>
            <div className="card">
                <h2>Update Daily Activity</h2>
                <form onSubmit={handleSubmit} className="inputs">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: '12px 0 20px 0', padding: '10px 12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                        <input
                            type="checkbox"
                            name="isLeave"
                            checked={formData.isLeave}
                            onChange={(e) => setFormData({ ...formData, isLeave: e.target.checked })}
                            style={{ width: '16px', height: '16px', margin: 0, cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '1rem', fontWeight: '600' }}>Mark as Leave</span>
                    </label>

                    <label>Exercise Type</label>
                    <select name="exerciseType" value={formData.exerciseType} onChange={handleChange}>
                        <option value="Running">Running</option>
                        <option value="Cycling">Cycling</option>
                        <option value="Gym">Gym</option>
                        <option value="Yoga">Yoga</option>
                        <option value="Meditation">Meditation</option>
                        <option value="Sports">Sports</option>
                        <option value="Other">Other</option>
                    </select>

                    <label>Exercise Duration (minutes)</label>
                    <input type="number" name="exerciseDuration" value={formData.exerciseDuration} onChange={handleChange} required />

                    <label>Water Intake (liters)</label>
                    <input type="number" step="0.1" name="waterIntake" value={formData.waterIntake} onChange={handleChange} required />

                    <label>Sleep Hours</label>
                    <input type="number" step="0.5" name="sleepHours" value={formData.sleepHours} onChange={handleChange} required />

                    <label>Stress Level</label>
                    <select name="stressLevel" value={formData.stressLevel} onChange={handleChange}>
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </select>

                    {!formData.isLeave && (
                        <>
                            <label>Work Location</label>
                            <select name="workLocation" value={formData.workLocation} onChange={handleChange}>
                                <option value="Onsite">Onsite</option>
                                <option value="Remote">Remote</option>
                                <option value="Home">Home</option>
                            </select>

                            <label>Employment Type</label>
                            <select name="employmentType" value={formData.employmentType} onChange={handleChange}>
                                <option value="Full Time">Full Time</option>
                                <option value="Part Time">Part Time</option>
                                <option value="Intern">Intern</option>
                            </select>
                        </>
                    )}

                    <label>Diet Plan</label>
                    <select name="dietPlan" value={formData.dietPlan} onChange={handleChange}>
                        <option value="Balanced">Balanced</option>
                        <option value="Keto">Keto</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Low Carb">Low Carb</option>
                    </select>



                    <label>Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Add details about your day..."
                        style={{ width: '100%', padding: '10px', marginTop: '5px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }}
                    ></textarea>

                    <button type="submit" className="btn">Update Activity</button>
                </form>
            </div>
        </div>
    );
};

export default UpdateActivity;
