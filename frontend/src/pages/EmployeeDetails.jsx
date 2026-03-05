import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';

const EmployeeDetails = () => {
    const { user, login } = useContext(AuthContext); // Assuming login can be used to update user context or we need a specific 'updateUser' function in context
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        bloodGroup: '',
        joiningDate: '',
        salaryPackage: '',
        smokingHabit: '',
        alcoholConsumption: ''
    });
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // Apply Twilight Mixed gradient to Profile page
        document.body.style.background = 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)';
        document.body.style.backgroundImage = 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%), radial-gradient(circle at 20% 20%, rgba(0, 198, 255, 0.3), transparent), radial-gradient(circle at 80% 80%, rgba(0, 114, 255, 0.3), transparent)';
        document.body.style.backgroundBlendMode = "normal";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";

        return () => {
            document.body.style.background = ""; // Clean up on unmount
            document.body.style.backgroundImage = "";
            document.body.style.backgroundBlendMode = "";
        };
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                age: user.age || '',
                gender: user.gender || '',
                maritalStatus: user.maritalStatus || '',
                shift: user.shift || '',
                location: user.location || '',
                department: user.department || '',
                bloodGroup: user.bloodGroup || '',
                joiningDate: user.joiningDate ? new Date(user.joiningDate).toISOString().split('T')[0] : '',
                salaryPackage: user.salaryPackage || '',
                smokingHabit: user.smokingHabit || '',
                alcoholConsumption: user.alcoholConsumption || '',
                profilePhoto: user.profilePhoto || ''
            });
        }
    }, [user]);

    // Calculate total experience
    const calculateTotalExperience = (joiningDate) => {
        if (!joiningDate) return '0';
        const diff = Date.now() - new Date(joiningDate).getTime();
        const yearsInCompany = diff / (1000 * 60 * 60 * 24 * 365.25);
        return yearsInCompany.toFixed(1);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('profilePhoto', file);

        setUploading(true);
        try {
            const res = await api.put('/users/profile-photo', formDataFile, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update the context with new user data (which includes profilePhoto)
            const updatedUser = { ...user, profilePhoto: res.data.profilePhoto };
            login(updatedUser);

            setMessage('Photo uploaded successfully!');
            alert('Photo uploaded successfully!');
        } catch (err) {
            console.error('Photo Upload Error:', err);
            alert('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple Validation
        if (!formData.name || !formData.email) {
            alert('Please fill in Name and Email');
            return;
        }

        console.log('PROFILE_UPDATE_SENDING:', formData);
        try {
            const res = await api.put('/users/profile', formData);
            console.log('PROFILE_UPDATE_RECEIVED:', res.data);

            // Update the context with new user data
            login(res.data);

            setMessage('Profile updated successfully!');

            // Save to guest profile for persistence after logout
            localStorage.setItem('guest_profile_data', JSON.stringify(res.data));

            alert('Profile updated successfully!'); // Immediate feedback
            setIsEditing(false);
        } catch (err) {
            console.error('Update Profile Error:', err);
            let errMsg = 'Failed to update profile';
            if (err.response) {
                errMsg = err.response.data.message || err.response.statusText;
            } else if (err.message) {
                errMsg = err.message;
            }
            setMessage(errMsg);
            alert(errMsg); // Immediate feedback
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <div className="card">
                <div style={styles.header}>
                    <h2>Employee Profile</h2>
                    <div style={styles.profilePhotoContainer}>
                        {user.profilePhoto ? (
                            <img
                                src={`http://localhost:5000${user.profilePhoto}`}
                                alt="Profile"
                                style={styles.profilePhoto}
                            />
                        ) : (
                            <div style={{ ...styles.profilePhoto, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', color: '#666', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                Profile
                            </div>
                        )}
                        <label style={styles.changePhotoBtn}>
                            {uploading ? 'Uploading...' : 'Change Photo'}
                            <input type="file" style={{ display: 'none' }} onChange={handleFileChange} disabled={uploading} />
                        </label>
                    </div>
                </div>

                {message && <p style={{ color: 'green' }}>{message}</p>}

                {!isEditing ? (
                    <div style={styles.details}>
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phone || 'Not set'}</p>
                        <p><strong>Age:</strong> {user.age || 'Not set'}</p>
                        <p><strong>Gender:</strong> {user.gender || 'Not set'}</p>
                        <p><strong>Blood Group:</strong> {user.bloodGroup || 'Not set'}</p>
                        <p><strong>Marital Status:</strong> {user.maritalStatus || 'Not set'}</p>
                        <p><strong>Shift:</strong> {user.shift || 'Not set'}</p>
                        <p><strong>Location:</strong> {user.location || 'Not set'}</p>
                        <p><strong>Department:</strong> {user.department || 'Not set'}</p>
                        <p><strong>Date of Joining:</strong> {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'Not set'}</p>
                        <p><strong>Total Experience:</strong> {calculateTotalExperience(user.joiningDate)} Years</p>
                        <p><strong>Salary Package:</strong> {user.salaryPackage || 'Not set'}</p>
                        <p><strong>Smoking Habit:</strong> {user.smokingHabit || 'Not set'}</p>
                        <p><strong>Alcohol Consumption:</strong> {user.alcoholConsumption || 'Not set'}</p>

                        <p><strong>Total Leaves:</strong> {user.totalLeaves || 20}</p>
                        <button onClick={() => setIsEditing(true)} className="btn" style={{ marginTop: '20px' }}>Edit Profile</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label>Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} />
                        </div>
                        <div style={styles.formGroup}>
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} />
                        </div>
                        <div style={styles.formGroup}>
                            <label>Phone</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div style={styles.formGroup}>
                            <label>Age</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} />
                        </div>
                        <div style={styles.formGroup}>
                            <label>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label>Blood Group</label>
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label>Marital Status</label>
                            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                                <option value="">Select Marital Status</option>
                                <option value="Married">Married</option>
                                <option value="Unmarried">Unmarried</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label>Shift</label>
                            <select name="shift" value={formData.shift} onChange={handleChange}>
                                <option value="">Select Shift</option>
                                <option value="Day Shift">Day Shift</option>
                                <option value="Night Shift">Night Shift</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label>Location</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} />
                        </div>
                        <div style={styles.formGroup}>
                            <label>Department</label>
                            <input type="text" name="department" value={formData.department} onChange={handleChange} />
                        </div>
                        <div style={styles.formGroup}>
                            <label>Date of Joining</label>
                            <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} />
                        </div>
                        <div style={styles.formGroup}>
                            <label>Salary Package</label>
                            <input type="text" name="salaryPackage" value={formData.salaryPackage} onChange={handleChange} />
                        </div>
                        <div style={styles.formGroup}>
                            <label>Smoking Habit</label>
                            <select name="smokingHabit" value={formData.smokingHabit} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label>Alcohol Consumption</label>
                            <select name="alcoholConsumption" value={formData.alcoholConsumption} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="submit" className="btn">Save Changes</button>
                            <button type="button" className="btn" style={{ backgroundColor: '#ccc' }} onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    profilePhotoContainer: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
    },
    profilePhoto: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #fff',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    changePhotoBtn: {
        backgroundColor: '#3498db',
        color: '#fff',
        padding: '5px 10px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        textAlign: 'center'
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        fontSize: '1.1rem',
        marginTop: '20px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        marginTop: '20px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    }
};

export default EmployeeDetails;
