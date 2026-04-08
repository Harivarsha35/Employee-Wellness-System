import { useEffect, useState, useContext } from 'react';
import api, { imageBaseURL } from '../utils/api';
import AuthContext from '../context/AuthContext';
import { calculateWellness } from '../utils/wellnessUtils';

const HRDashboard = () => {
    const { user } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);
    const [allActivities, setAllActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmpForDetails, setSelectedEmpForDetails] = useState(null);
    const [sentAlerts, setSentAlerts] = useState([]);

    const handleSendHealthAlert = async (empId, empName) => {
        try {
            await api.post('/notifications', {
                recipientId: empId,
                message: `Hi ${empName}, HR has noticed your wellness metrics (sleep/stress) are in the 'At Risk' category. Please prioritize your rest or consult with your manager for support.`,
                type: 'HealthAlert'
            });
            setSentAlerts(prev => [...prev, empId]);
            alert(`Health alert sent to ${empName}`);
        } catch (err) {
            console.error("Error sending health alert:", err);
            alert("Failed to send health alert.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersRes = await api.get('/users');
                const activitiesRes = await api.get('/activities/all');

                // Filter out Admins and HRs to show only regular Employees
                const filteredEmployees = usersRes.data.filter(emp => emp.role !== 'Admin' && emp.role !== 'HR');
                const filteredActivities = activitiesRes.data.filter(activity =>
                    activity.user && activity.user.role !== 'Admin' && activity.user.role !== 'HR'
                );

                setEmployees(filteredEmployees);
                setAllActivities(filteredActivities);
            } catch (err) {
                console.error("Error fetching HR data:", err);
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
            avgW: stats.avgWater,
            avgStr: stats.avgStress
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

    const hasLogToday = (empId) => {
        const todayStr = new Date().toDateString();
        return allActivities.some(a =>
            a.user && a.user._id === empId && new Date(a.date).toDateString() === todayStr
        );
    };

    const getMissingDays = (empId, joiningDate) => {
        const daysToCheck = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fixed start date: March 1st, 2026
        const fixedStartDate = new Date('2026-03-01T00:00:00');

        // Start from joining date or March 1st, whichever is later
        let startDate = joiningDate ? new Date(joiningDate) : fixedStartDate;
        if (startDate < fixedStartDate) startDate = fixedStartDate;
        startDate.setHours(0, 0, 0, 0);

        // Generate all days from today back to startDate
        for (let d = new Date(today); d >= startDate; d.setDate(d.getDate() - 1)) {
            daysToCheck.push(new Date(d).toDateString());
        }

        const userActivities = allActivities.filter(a => a.user && (a.user._id === empId || a.user === empId));
        const activityDates = userActivities.map(a => new Date(a.date).toDateString());

        return daysToCheck.map(dateStr => ({
            date: dateStr,
            status: activityDates.includes(dateStr) ? 'Updated' : 'Missing'
        }));
    };

    const missingLogEmployees = employees.filter(emp => {
        const missingDays = getMissingDays(emp._id, emp.joiningDate);
        return missingDays.some(day => day.status === 'Missing');
    });

    const atRiskEmployees = employees.filter(emp => {
        const stats = getIndividualWellness(emp._id, emp.bmiCategory);
        return stats.status === 'At Risk';
    });

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container-large">
            <h1>HR Dashboard</h1>
            <p>Welcome, {user && user.name} ({user && user.role})</p>

            <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                {/* Missing Daily Update Notifications (Blackmark) */}
                {missingLogEmployees.length > 0 && (
                    <div style={{
                        padding: '20px',
                        background: '#f8f9fa',
                        border: '1px solid #343a40',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <h2 style={{ color: '#343a40', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Action Required: Missing Daily Updates ({missingLogEmployees.length})
                        </h2>
                        <p style={{ color: '#444', marginBottom: '15px' }}>
                            The following employees have missing daily wellness updates (since March 1st, 2026):
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                            {missingLogEmployees.map(emp => {
                                const isUpdatedToday = hasLogToday(emp._id);
                                const missingCount = getMissingDays(emp._id, emp.joiningDate).filter(d => d.status === 'Missing').length;

                                return (
                                    <div key={emp._id} className="hover-card" style={{
                                        padding: '10px 15px',
                                        background: '#fff',
                                        borderLeft: `5px solid ${isUpdatedToday ? '#27ae60' : '#343a40'}`,
                                        borderRadius: '6px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }} onClick={() => setSelectedEmpForDetails(emp)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ fontSize: '1.05rem', color: '#2c3e50', borderBottom: '1px dashed #2c3e50' }}>{emp.name}</strong>
                                            {isUpdatedToday ?
                                                <span style={{ fontSize: '0.75rem', background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Today ✅</span> :
                                                <span style={{ fontSize: '0.75rem', background: '#ffebee', color: '#c62828', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Missing Today</span>
                                            }
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                            {emp.department} • <span style={{ color: isUpdatedToday ? '#666' : '#c62828', fontWeight: isUpdatedToday ? 'normal' : 'bold' }}>{missingCount} day{missingCount > 1 ? 's' : ''} missing</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* At-Risk Notifications Section */}
                {atRiskEmployees.length > 0 && (
                    <div style={{
                        marginTop: '20px',
                        padding: '20px',
                        background: '#fff5f5',
                        border: '1px solid #e74c3c',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <h2 style={{ color: '#c0392b', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            ⚠️ At Risk Employees ({atRiskEmployees.length})
                        </h2>
                        <p style={{ color: '#444', marginBottom: '15px' }}>
                            The following employees have high stress or poor wellness metrics and may need support:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                            {atRiskEmployees.map(emp => (
                                <div key={emp._id} className="hover-card" style={{
                                    padding: '12px 15px',
                                    background: '#fff',
                                    borderLeft: '5px solid #e74c3c',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <strong style={{ fontSize: '1.1rem' }}>{emp.name}</strong>
                                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>{emp.department} • {emp.role}</div>
                                    </div>
                                    <button
                                        onClick={() => handleSendHealthAlert(emp._id, emp.name)}
                                        style={{
                                            background: '#e74c3c',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            textAlign: 'center'
                                        }}
                                        disabled={sentAlerts.includes(emp._id)}
                                    >
                                        {sentAlerts.includes(emp._id) ? '✅ Alert Sent' : '📢 Send Health Alert'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Missing Days Modal */}
            {selectedEmpForDetails && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '400px', padding: '25px', position: 'relative' }}>
                        <h3 style={{ marginBottom: '10px' }}>Missing Updates (Since March 1st): {selectedEmpForDetails.name}</h3>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>Specific days without a wellness update:</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                            {getMissingDays(selectedEmpForDetails._id, selectedEmpForDetails.joiningDate)
                                .filter(day => day.status === 'Missing')
                                .map((day, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '12px 15px',
                                        background: '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px solid #343a40'
                                    }}>
                                        <span style={{ fontWeight: '500' }}>{new Date(day.date).toDateString() === new Date().toDateString() ? 'Today' : new Date(day.date).toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString() ? 'Yesterday' : day.date}</span>
                                        <strong style={{ color: '#343a40' }}>Blackmark</strong>
                                    </div>
                                ))}
                            {getMissingDays(selectedEmpForDetails._id, selectedEmpForDetails.joiningDate).filter(day => day.status === 'Missing').length === 0 && (
                                <p style={{ textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }}>✅ All caught up!</p>
                            )}
                        </div>

                        <button
                            className="btn"
                            style={{ marginTop: '20px', width: '100%' }}
                            onClick={() => setSelectedEmpForDetails(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

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
                                <th style={{ padding: '16px', fontSize: '1.1rem', textAlign: 'center' }}>Avg Stress</th>
                                <th style={{ padding: '16px', fontSize: '1.1rem', textAlign: 'center' }}>Wellness</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
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
                                                <td style={{
                                                    padding: '16px', fontSize: '1.1rem', textAlign: 'center', color: stats.avgStr
                                                        ? (stats.avgStr <= 3 ? '#27ae60' // green
                                                            : stats.avgStr <= 4 ? '#f39c12' // yellow
                                                                : '#e74c3c') // red
                                                        : '#000', fontWeight: 'bold'
                                                }}>{stats.avgStr ? `${stats.avgStr}/5` : '-'}</td>
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
                <h2>Recent Employee Activities</h2>
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

export default HRDashboard;
