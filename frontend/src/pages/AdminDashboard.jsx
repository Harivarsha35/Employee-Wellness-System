import { useEffect, useState, useContext } from 'react';
import api, { imageBaseURL } from '../utils/api';
import AuthContext from '../context/AuthContext';
import { calculateWellness } from '../utils/wellnessUtils';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);
    const [allActivities, setAllActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersRes = await api.get('/users');
                const activitiesRes = await api.get('/activities/all');

                setEmployees(usersRes.data);
                setAllActivities(activitiesRes.data);
            } catch (err) {
                console.error("Error fetching Admin data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const calculateTotalExperience = (joiningDate) => {
        if (!joiningDate) return '0';
        const diff = Date.now() - new Date(joiningDate).getTime();
        const yearsInCompany = diff / (1000 * 60 * 60 * 24 * 365.25);
        return yearsInCompany.toFixed(1);
    };

    const wellness = calculateWellness(allActivities, user?.bmiCategory);

    const getIndividualWellness = (empId, bmiCategory) => {
        const empActivities = allActivities.filter(a => a.user && a.user._id === empId);
        const stats = calculateWellness(empActivities, bmiCategory);
        return {
            status: stats.status,
            color: stats.color,
            avgS: stats.avgSleep,
            avgW: stats.avgWater
        };
    };

    const summaryCardStyle = {
        padding: '20px',
        borderRadius: '12px',
        background: '#fff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        textAlign: 'center',
        flex: '1'
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container-large">
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user && user.name} ({user && user.role})</p>

            <div style={{ marginTop: '30px' }}>
                <h2>All Employees</h2>

                <div className="card" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '16px', fontSize: '1.1rem' }}>Photo</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem' }}>Name</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem' }}>Email</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem' }}>Department</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem' }}>Role</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem' }}>Marital Status</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem' }}>Shift</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem' }}>Location</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem' }}>Experience</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem' }}>Salary</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem' }}>Smoking</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem' }}>Alcohol</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem', textAlign: 'center' }}>Avg Sleep</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem', textAlign: 'center' }}>Avg Water</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem', textAlign: 'center' }}>Wellness</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.filter(emp => emp.role !== 'Admin').map(emp => (
                                <tr key={emp._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '16px' }}>
                                        {emp.profilePhoto ? (
                                            <img
                                                src={`${imageBaseURL}${emp.profilePhoto}`}
                                                alt={emp.name}
                                                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '50%',
                                                background: '#f0f0f0',
                                                color: '#666',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {emp.name ? emp.name.charAt(0) : 'U'}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '1.1rem' }}>{emp.name}</td>
                                    <td style={{ padding: '16px', fontSize: '1.1rem' }}>{emp.email}</td>
                                    <td style={{ padding: '16px', fontSize: '1.1rem' }}>{emp.department}</td>
                                    <td style={{ padding: '16px', fontSize: '1.1rem' }}>{emp.role}</td>
                                    <td style={{ padding: '16px', fontSize: '1.1rem' }}>{emp.maritalStatus || '-'}</td>
                                    <td style={{ padding: '16px', fontSize: '1.1rem' }}>{emp.shift || '-'}</td>
                                    <td style={{ padding: '16px', fontSize: '1.1rem' }}>{emp.location || '-'}</td>
                                    <td style={{ padding: '16px', fontSize: '1.1rem' }}>{calculateTotalExperience(emp.joiningDate)} Yrs</td>
                                    <td style={{ padding: '16px', fontSize: '1.1rem' }}>{emp.salaryPackage || '-'}</td>
                                    <td style={{ padding: '16px', fontSize: '1.1rem' }}>{emp.smokingHabit || '-'}</td>
                                    <td style={{ padding: '16px', fontSize: '1.1rem' }}>{emp.alcoholConsumption || '-'}</td>
                                    {(() => {
                                        const stats = getIndividualWellness(emp._id, emp.bmiCategory);
                                        return (
                                            <>
                                                <td style={{ padding: '16px', fontSize: '1.1rem', textAlign: 'center' }}>{stats.avgS ? `${stats.avgS}h` : '-'}</td>
                                                <td style={{ padding: '16px', fontSize: '1.1rem', textAlign: 'center' }}>{stats.avgW ? `${stats.avgW}L` : '-'}</td>
                                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        background: stats.color,
                                                        color: '#fff',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 'bold',
                                                        display: 'inline-block',
                                                        minWidth: '90px',
                                                        textAlign: 'center',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {stats.status}
                                                    </span>
                                                </td>
                                            </>
                                        );
                                    })()}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h2>System Activities</h2>
                {allActivities.length > 0 ? (
                    <div className="grid">
                        {allActivities.map(activity => (
                            <div key={activity._id} className="card" style={{ maxWidth: '75%', margin: '0 0 20px 0' }}>
                                <h4 style={{ marginBottom: '5px' }}>{activity.user ? activity.user.name : 'Unknown User'} ({activity.user ? activity.user.department : 'N/A'})</h4>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>{new Date(activity.date).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString()}</p>
                                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>
                                    <li><strong>Exercise:</strong> {activity.exerciseType || 'Other'} ({activity.exerciseDuration || activity.exerciseTime || 0} mins)</li>
                                    <li><strong>Water:</strong> {activity.waterIntake} L</li>
                                    <li><strong>Sleep:</strong> {activity.sleepHours} hrs</li>
                                    <li><strong>Stress Level:</strong> {activity.stressLevel}/5</li>
                                    <li><strong>Employment Type:</strong> {activity.employmentType || 'Full Time'}</li>
                                    <li><strong>Diet Plan:</strong> {activity.dietPlan}</li>
                                    {activity.notes && <li style={{ marginTop: '5px', fontStyle: 'italic' }}><strong>Note:</strong> "{activity.notes}"</li>}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No activities found.</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
