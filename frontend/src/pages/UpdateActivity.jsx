import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const UpdateActivity = () => {
    const [formData, setFormData] = useState({
        exerciseType: 'Other',
        exerciseDuration: '',
        waterIntake: '',
        sleepHours: '',
        stressLevel: 5,
        dietPlan: 'Balanced',
        workLocation: 'Onsite',
        employmentType: 'Full Time',
        notes: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Sending Activity Data:', formData); // Debug Log
        try {
            await api.post('/activities', formData);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.response) {
                alert(err.response.data.message || 'Failed to update activity');
            } else if (err.request) {
                alert('No response from server. Check if backend is running.');
            } else {
                alert('Error: ' + err.message);
            }
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px' }}>
            <div className="card">
                <h2>Update Daily Activity</h2>
                <form onSubmit={handleSubmit} className="inputs">
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

                    <label>Stress Level (1-10)</label>
                    <input type="number" min="1" max="10" name="stressLevel" value={formData.stressLevel} onChange={handleChange} required />

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

                    <label>Diet Plan</label>
                    <select name="dietPlan" value={formData.dietPlan} onChange={handleChange}>
                        <option value="Balanced">Balanced</option>
                        <option value="Keto">Keto</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Low Carb">Low Carb</option>
                    </select>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '15px' }}>
                        <input
                            type="checkbox"
                            name="isLeave"
                            checked={formData.isLeave}
                            onChange={(e) => setFormData({ ...formData, isLeave: e.target.checked })}
                            style={{ width: 'auto', margin: 0 }}
                        />
                        <span>Mark as Leave</span>
                    </label>

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
