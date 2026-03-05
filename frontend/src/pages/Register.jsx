import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Employee'
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Change background color when component mounts
    useEffect(() => {
        document.body.style.background = 'linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)';
        return () => {
            document.body.style.background = ''; // Reset to default CSS
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);

            // Auto-login after successful registration
            const loginRes = await api.post('/users/login', {
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            login(loginRes.data);
            const role = formData.role;
            const dashboardPath = role === 'HR' ? "/hr-dashboard" : role === 'Admin' ? "/admin-dashboard" : "/dashboard";
            navigate(dashboardPath);
        } catch (err) {
            console.error("Registration error:", err);
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setError(err.response.data.message || 'Registration failed');
            } else if (err.request) {
                // The request was made but no response was received
                setError('No response from server. Please check if the backend is running.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError('Request error: ' + err.message);
            }
        }
    };

    return (
        <div className="register-page" style={{ position: 'relative' }}>
            {/* Back to Home Button */}
            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <ArrowLeft size={24} color="#333" />
            </button>

            <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
                <div className="card">
                    <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <form onSubmit={handleSubmit} className="inputs">
                        <select name="role" onChange={handleChange} value={formData.role} style={{ marginBottom: '10px', padding: '10px', width: '100%' }}>
                            <option value="Employee">Employee</option>
                            <option value="Admin">Admin</option>
                            <option value="HR">HR</option>
                        </select>
                        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
                        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                        <div style={{ position: 'relative', width: '100%', marginBottom: '10px' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                                required
                                style={{ width: '100%', paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#666'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>



                        <div style={{ marginTop: '20px' }}>
                            <button type="submit" className="btn" style={{ width: '100%' }}>Register</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
