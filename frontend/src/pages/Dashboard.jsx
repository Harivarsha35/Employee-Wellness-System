import { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [activities, setActivities] = useState([]);
    const [guestBmi, setGuestBmi] = useState(null);
    const [guestProfile, setGuestProfile] = useState(null);

    useEffect(() => {
        // Load guest data fallbacks
        const savedBmi = localStorage.getItem('guest_bmi_data');
        if (savedBmi) setGuestBmi(JSON.parse(savedBmi));

        const savedProfile = localStorage.getItem('guest_profile_data');
        if (savedProfile) setGuestProfile(JSON.parse(savedProfile));

        const fetchActivities = async () => {
            if (!user) return; // Skip for guests or until user info is ready
            try {
                const res = await api.get('/activities');
                setActivities(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchActivities();
    }, [user]);

    // Calculate averages or totals
    const totalActivities = activities.length;
    const avgSleep = activities.reduce((acc, curr) => acc + curr.sleepHours, 0) / (totalActivities || 1);
    const avgWater = activities.reduce((acc, curr) => acc + curr.waterIntake, 0) / (totalActivities || 1);
    const avgStress = activities.reduce((acc, curr) => acc + (Number(curr.stressLevel) || 5), 0) / (totalActivities || 1);

    const getWellnessStatus = () => {
        if (totalActivities === 0) return { status: 'N/A', color: '#aaa', icon: '📝' };
        if (totalActivities < 1) return { status: 'Gathering Data', color: '#7f8c8d', icon: '⏳' };

        if (avgSleep >= 7 && avgWater >= 2 && avgStress <= 4) {
            return { status: 'Healthy', color: '#27ae60', icon: '😇' };
        } else if (avgSleep < 6 || avgStress > 7) {
            return { status: 'Need Rest', color: '#e74c3c', icon: '😴' };
        } else {
            return { status: 'Balanced', color: '#f39c12', icon: '⚖️' };
        }
    };

    const wellness = getWellnessStatus();

    const isProfileIncomplete = user && (!user.phone || !user.age || !user.gender || !user.department);

    const cardStyle = {
        margin: 0,
        height: '180px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    };

    return (
        <div className="container">
            {isProfileIncomplete && (
                <div style={{
                    background: '#fff3cd',
                    color: '#856404',
                    border: '1px solid #ffeeba',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}>
                    ⚠️ Your profile is incomplete. Please <a href="/employee-details" style={{ textDecoration: 'underline', color: '#856404' }}>update your details</a> (Phone, Age, Gender, Dept, etc.)
                </div>
            )}
            <h1>Welcome, {user ? user.name : guestProfile ? guestProfile.name : 'Guest'}</h1>
            <div style={styles.grid}>
                {/* Column 1: Logs & BMI */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card" style={cardStyle}>
                        <h3>Total Logs</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalActivities}</p>
                        <span>&nbsp;</span> {/* Spacer to balance height */}
                    </div>
                    {(user?.bmi || (!user && guestBmi)) ? (
                        <div className="card" style={cardStyle}>
                            <h3 style={{ margin: 0 }}>BMI Result {!user && guestBmi && '(Guest)'}</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{user?.bmi || (guestBmi && guestBmi.bmi)}</div>
                            <div style={{
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                color: getCategoryColor(user?.bmiCategory || (guestBmi && guestBmi.category)),
                                padding: '4px 12px',
                                borderRadius: '4px',
                                background: '#f8f9fa',
                                width: 'fit-content'
                            }}>
                                {user?.bmiCategory || (guestBmi && guestBmi.category)}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Column 2: Sleep & Wellness */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card" style={cardStyle}>
                        <h3>Avg Sleep</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{avgSleep.toFixed(1)} <span style={{ fontSize: '1rem' }}>hrs</span></p>
                        <p style={{ fontSize: '0.9rem', color: avgSleep < 7 ? '#e67e22' : '#27ae60', margin: 0 }}>
                            {avgSleep < 7 ? 'Target: 7-9h' : 'Excellent rest!'}
                        </p>
                    </div>
                    <div className="card" style={{ ...cardStyle, borderTop: `5px solid ${wellness.color}` }}>
                        <h3 style={{ color: wellness.color, margin: 0 }}>{wellness.icon} Wellness</h3>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: wellness.color, margin: '5px 0' }}>{wellness.status}</p>
                        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Based on last {totalActivities} logs</p>
                    </div>
                </div>

                {/* Column 3: Water */}
                <div className="card" style={cardStyle}>
                    <h3>Avg Water</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{avgWater.toFixed(1)} <span style={{ fontSize: '1rem' }}>L</span></p>
                    <p style={{ fontSize: '0.9rem', color: avgWater < 2 ? '#e67e22' : '#27ae60', margin: 0 }}>
                        {avgWater < 2 ? 'Target: 2-3L' : 'Well hydrated!'}
                    </p>
                </div>

                {/* Column 4: Stress */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card" style={cardStyle}>
                        <h3>Avg Stress</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{avgStress.toFixed(1)}<span style={{ fontSize: '1.2rem' }}>/10</span></p>
                        <p style={{ fontSize: '0.9rem', color: avgStress > 5 ? '#e74c3c' : '#27ae60', margin: 0 }}>
                            {avgStress > 5 ? 'High Stress' : 'Feeling calm'}
                        </p>
                    </div>
                </div>
            </div>


            <h2 style={{ marginTop: '2rem' }}>Recent Activity</h2>
            {activities.length > 0 ? (
                <ul className="card">
                    {activities.slice(0, 5).map(activity => (
                        <li key={activity._id} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{new Date(activity.date).toLocaleDateString()}</div>
                            <div>
                                <strong>Exercise:</strong> {activity.exerciseType || 'Other'} ({activity.exerciseDuration || activity.exerciseTime || 0} mins) |
                                <strong> Water:</strong> {activity.waterIntake}L |
                                <strong> Sleep:</strong> {activity.sleepHours}h
                            </div>
                            <div style={{ marginTop: '5px', fontSize: '0.95rem', color: '#555' }}>
                                <strong>Stress Lvl:</strong> {activity.stressLevel}/10 |
                                <strong> Diet:</strong> {activity.dietPlan} |
                                <strong> Job:</strong> {activity.employmentType || 'Full Time'}
                            </div>
                            {activity.notes && (
                                <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#666', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                                    Note: "{activity.notes}"
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No activities logged yet.</p>
            )
            }
        </div >
    );
};

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginTop: '20px',
        alignItems: 'start'
    }
};

const getCategoryColor = (category) => {
    switch (category) {
        case 'Underweight': return '#f39c12';
        case 'Normal weight': return '#27ae60';
        case 'Overweight': return '#e67e22';
        case 'Obese': return '#e74c3c';
        default: return '#333';
    }
};

export default Dashboard;
