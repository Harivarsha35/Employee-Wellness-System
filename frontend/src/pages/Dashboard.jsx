import { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { calculateWellness } from '../utils/wellnessUtils';

const Dashboard = () => {
    const { user, login } = useContext(AuthContext);
    const [activities, setActivities] = useState([]);
    const [guestBmi, setGuestBmi] = useState(null);
    const [guestProfile, setGuestProfile] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Load guest data fallbacks
        const savedBmi = localStorage.getItem('guest_bmi_data');
        if (savedBmi) setGuestBmi(JSON.parse(savedBmi));

        const savedProfile = localStorage.getItem('guest_profile_data');
        if (savedProfile) setGuestProfile(JSON.parse(savedProfile));

        const fetchActivities = async () => {
            if (!user?._id) return; // Skip for guests or until user info is ready
            try {
                const res = await api.get('/activities');
                setActivities(res.data);

                // Fetch notifications
                const notifRes = await api.get('/notifications');
                setNotifications(notifRes.data.filter(n => !n.isRead));
            } catch (err) {
                console.error(err);
            }
        };
        fetchActivities();
    }, [user?._id]);

    const wellness = calculateWellness(activities, user?.bmiCategory);

    const handleDismissNotification = async (notifId) => {
        try {
            await api.put(`/notifications/${notifId}/read`);
            setNotifications(prev => prev.filter(n => n._id !== notifId));
        } catch (err) {
            console.error("Error dismissing notification:", err);
        }
    };

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

            {/* Health Alerts from HR */}
            {notifications.map(notif => (
                <div key={notif._id} style={{
                    background: '#fff5f5',
                    color: '#c0392b',
                    border: '2px solid #e74c3c',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '25px',
                    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.1)',
                    position: 'relative',
                    animation: 'pulse 2s infinite'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                        <span style={{ fontSize: '1.5rem', marginTop: '42px' }}>📢</span>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '12px' }}>
                                <h3 style={{ margin: '0 0 5px 0', color: '#e74c3c' }}>Health Alert from {notif.sender?.name || 'HR'}</h3>
                                <span style={{ fontSize: '0.9rem', color: '#c0392b', fontWeight: 'bold', background: 'rgba(231, 76, 60, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                    {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.5' }}>{notif.message}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleDismissNotification(notif._id)}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'none',
                            border: 'none',
                            color: '#e74c3c',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '5px'
                        }}
                    >
                        &times;
                    </button>
                    <style>{`
                        @keyframes pulse {
                            0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
                            70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
                        }
                    `}</style>
                </div>
            ))}
            <h1>Welcome, {user ? user.name : guestProfile ? guestProfile.name : 'Guest'}</h1>
            <div style={styles.grid}>
                {/* Column 1: BMI */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {(user?.bmi || (!user && guestBmi)) ? (
                        <div className="card hover-card" style={{ ...cardStyle, height: 'auto', minHeight: '180px' }}>
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
                            {(() => {
                                const cat = user?.bmiCategory || (guestBmi && guestBmi.category);
                                if (cat === 'Overweight' || cat === 'Obese') return (
                                    <div style={{ marginTop: '10px', padding: '10px', background: '#fff5f5', borderRadius: '8px', border: '1px solid #e74c3c', fontSize: '0.8rem', color: '#444' }}>
                                        <strong style={{ color: '#c0392b' }}>💡 Tips to Reduce Weight</strong>
                                        <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px', lineHeight: '1.7' }}>
                                            <li>🥗 Eat more vegetables & whole grains</li>
                                            <li>🚶 Walk 30 minutes every day</li>
                                            <li>💧 Drink 8–10 glasses of water daily</li>
                                            <li>🍽️ Avoid junk food & sugary drinks</li>
                                            <li>😴 Get 7–8 hours of sleep nightly</li>
                                            <li>🏋️ Try strength training 3×/week</li>
                                            <li>🧘 Manage stress to avoid weight gain</li>
                                            <li>🩺 Consult a doctor for a personal plan</li>
                                        </ul>
                                    </div>
                                );
                                if (cat === 'Underweight') return (
                                    <div style={{ marginTop: '10px', padding: '10px', background: '#fffbea', borderRadius: '8px', border: '1px solid #f39c12', fontSize: '0.8rem', color: '#444' }}>
                                        <strong style={{ color: '#b7770d' }}>💡 Tips to Gain Healthy Weight</strong>
                                        <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px', lineHeight: '1.7' }}>
                                            <li>🥜 Eat nuts, dairy & protein-rich foods</li>
                                            <li>🍚 Have 5–6 small meals a day</li>
                                            <li>🏋️ Do strength exercises to build muscle</li>
                                            <li>🩺 Consult a doctor for guidance</li>
                                        </ul>
                                    </div>
                                );
                                if (cat === 'Normal weight') return (
                                    <p style={{ marginTop: '8px', color: '#27ae60', fontSize: '0.85rem', margin: '8px 0 0 0' }}>✅ Great! Keep maintaining your healthy lifestyle.</p>
                                );
                                return null;
                            })()}
                        </div>
                    ) : null}
                </div>

                {/* Column 2: Logs, Stress & Water */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card hover-card" style={cardStyle}>
                        <h3>Total Logs</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{activities.length}</p>
                        <span>&nbsp;</span> {/* Spacer to balance height */}
                    </div>
                    <div className="card hover-card" style={cardStyle}>
                        <h3>Avg Stress</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{wellness.avgStress}<span style={{ fontSize: '1.2rem' }}>/5</span></p>
                        <p style={{ fontSize: '0.9rem', color: wellness.avgStress > 3 ? '#e74c3c' : '#27ae60', margin: 0 }}>
                            {wellness.avgStress > 3 ? 'High Stress' : 'Feeling calm'}
                        </p>
                    </div>
                    <div className="card hover-card" style={cardStyle}>
                        <h3>Avg Water</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{wellness.avgWater} <span style={{ fontSize: '1rem' }}>L</span></p>
                        <p style={{ fontSize: '0.9rem', color: wellness.avgWater < 5 ? '#e67e22' : '#27ae60', margin: 0 }}>
                            {wellness.avgWater < 5 ? 'Target: 5L+' : 'Well hydrated!'}
                        </p>
                    </div>
                </div>

                {/* Column 3: Sleep, Wellness & Leaves */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card hover-card" style={cardStyle}>
                        <h3>Avg Sleep</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{wellness.avgSleep} <span style={{ fontSize: '1rem' }}>hrs</span></p>
                        <p style={{ fontSize: '0.9rem', color: wellness.avgSleep < 6 ? '#e67e22' : '#27ae60', margin: 0 }}>
                            {wellness.avgSleep < 6 ? 'Target: 6h+' : 'Excellent rest!'}
                        </p>
                    </div>
                    <div className="card hover-card" style={{ ...cardStyle, borderTop: `5px solid ${wellness.color}` }}>
                        <h3 style={{ color: wellness.color, margin: 0 }}>{wellness.icon} Wellness</h3>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: wellness.color, margin: '5px 0' }}>{wellness.status}</p>
                        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Based on last {activities.length} logs</p>
                    </div>
                    <div className="card hover-card" style={{
                        ...cardStyle,
                        borderTop: activities.filter(a => a.isLeave).length > 5 ? '5px solid #e74c3c' : activities.filter(a => a.isLeave).length >= 4 ? '5px solid #f1c40f' : '5px solid #27ae60'
                    }}>
                        <h3>Leaves Taken</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: activities.filter(a => a.isLeave).length > 5 ? '#e74c3c' : activities.filter(a => a.isLeave).length >= 4 ? '#d4ac0d' : '#27ae60' }}>{activities.filter(a => a.isLeave).length}</p>
                        <p style={{ fontSize: '0.9rem', margin: 0, color: activities.filter(a => a.isLeave).length > 5 ? '#e74c3c' : activities.filter(a => a.isLeave).length >= 4 ? '#d4ac0d' : '#27ae60' }}>
                            {activities.filter(a => a.isLeave).length > 5 ? '⚠️ More days leave!' : activities.filter(a => a.isLeave).length >= 4 ? `${activities.filter(a => a.isLeave).length} days taken` : activities.filter(a => a.isLeave).length > 0 ? `${activities.filter(a => a.isLeave).length} day${activities.filter(a => a.isLeave).length > 1 ? 's' : ''} taken` : 'No leaves taken'}
                        </p>
                    </div>
                </div>
            </div>




            <h2 style={{ marginTop: '2rem' }}>Recent Activity</h2>
            {activities.length > 0 ? (
                <div style={{ maxHeight: '500px', overflowY: 'auto', borderRadius: '8px' }}>
                    <ul className="card" style={{ margin: 0 }}>
                    {activities.map(activity => (
                        <li key={activity._id} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', marginBottom: '5px' }}>
                                {new Date(activity.date).toLocaleDateString()}
                                {activity.isLeave && (
                                    <span style={{
                                        background: '#fff3cd',
                                        color: '#856404',
                                        border: '1px solid #ffc107',
                                        borderRadius: '12px',
                                        padding: '2px 10px',
                                        fontSize: '0.78rem',
                                        fontWeight: '600',
                                        letterSpacing: '0.3px'
                                    }}>🏖️ On Leave</span>
                                )}
                            </div>
                            <div>
                                <strong>Exercise:</strong> {activity.exerciseType || 'Other'} ({activity.exerciseDuration || activity.exerciseTime || 0} mins) |
                                <strong> Water:</strong> {activity.waterIntake}L |
                                <strong> Sleep:</strong> {activity.sleepHours}h
                            </div>
                            <div style={{ marginTop: '5px', fontSize: '0.95rem', color: '#555' }}>
                                <strong>Stress Lvl:</strong> {activity.stressLevel}/5 |
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
                </div>
            ) : (
                <p>No activities logged yet.</p>
            )}
        </div>
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
