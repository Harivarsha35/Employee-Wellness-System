import { useState, useContext, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Employee');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

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
            const res = await api.post('/users/login', { email, password, role });
            login(res.data);
            const dashboardPath = role === 'HR' ? "/hr-dashboard" : role === 'Admin' ? "/admin-dashboard" : "/dashboard";
            navigate(dashboardPath);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10vh' }}>
            {/* Back to Home Button */}
            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '-85px',
                    right: '20px',
                    background: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
            >
                <ArrowLeft size={24} color="#333" />
            </button>


            <div className="container" style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
                <div className="card">
                    <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <form onSubmit={handleSubmit} className="inputs">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{ marginBottom: '15px', padding: '10px', width: '100%' }}
                        >
                            <option value="Employee">Employee</option>
                            <option value="HR">HR</option>
                        </select>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                        <button type="submit" className="btn">Login</button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        Don't have an account? <Link to="/register" style={{ color: '#4a90e2' }}>Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
