import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Home, User, Activity, LogOut, LayoutDashboard, LogIn, UserPlus, ArrowLeft, Calculator } from 'lucide-react';
import BMICalculatorModal from './BMICalculatorModal';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [isBMIModalOpen, setIsBMIModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>Employee Wellness System</Link>
                <ul style={styles.links}>
                    {user ? (
                        <>
                            {!['/login', '/register', '/'].includes(location.pathname) && (
                                <>
                                    <li>
                                        <Link to={user.role === 'HR' ? "/hr-dashboard" : user.role === 'Admin' ? "/admin-dashboard" : "/dashboard"} className="nav-link" style={styles.link}>
                                            <LayoutDashboard size={18} /> Dashboard
                                        </Link>
                                    </li>
                                    <li><Link to="/employee-details" className="nav-link" style={styles.link}><User size={18} /> Profile</Link></li>
                                    {user.role !== 'HR' && user.role !== 'Admin' && (
                                        <>
                                            <li><Link to="/update-activity" className="nav-link" style={styles.link}><Activity size={18} /> Update Activity</Link></li>
                                            <li>
                                                <button onClick={() => setIsBMIModalOpen(true)} className="bmi-nav-btn" style={styles.bmiBtn}>
                                                    <Calculator size={18} /> BMI Calculation
                                                </button>
                                            </li>
                                        </>
                                    )}
                                    <li><button onClick={handleLogout} className="btn" style={{ ...styles.btn, height: '35px', padding: '0 15px' }}><LogOut size={18} /> Logout</button></li>
                                    <BMICalculatorModal isOpen={isBMIModalOpen} onClose={() => setIsBMIModalOpen(false)} />
                                    <style>{`
                                        .bmi-nav-btn, .nav-link, .nav-btn {
                                            transition: all 0.3s ease !important;
                                            text-decoration: none !important;
                                            display: inline-flex !important;
                                            align-items: center !important;
                                            gap: 5px !important;
                                        }
                                        .bmi-nav-btn:hover, .nav-link:hover, .nav-btn:hover {
                                            color: #4a90e2 !important;
                                            transform: translateY(-2px);
                                        }
                                        .bmi-nav-btn svg, .nav-link svg, .nav-btn svg {
                                            transition: transform 0.3s ease !important;
                                            vertical-align: middle;
                                            margin-top: 2px;
                                        }
                                        .bmi-nav-btn:hover svg, .nav-link:hover svg, .nav-btn:hover svg {
                                            transform: rotate(15deg);
                                        }
                                    `}</style>
                                </>
                            )}
                            {location.pathname === '/' && (
                                <>
                                    <li><Link to="/login" className="nav-btn"><LogIn size={16} style={{ marginRight: '5px' }} /> Login</Link></li>
                                    <li style={{ marginLeft: '10px' }}><Link to="/register" className="nav-btn"><UserPlus size={16} style={{ marginRight: '5px' }} /> Register</Link></li>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {!['/login', '/register', '/'].includes(location.pathname) && (
                                <li><Link to="/dashboard" className="nav-link" style={styles.link}><LayoutDashboard size={18} /> Dashboard</Link></li>
                            )}
                            {!['/login', '/register'].includes(location.pathname) && (
                                <>
                                    <li><Link to="/login" style={styles.navBtn}><LogIn size={16} style={{ marginRight: '5px' }} /> Login</Link></li>
                                    <li style={{ marginLeft: '10px' }}><Link to="/register" style={styles.navBtn}><UserPlus size={16} style={{ marginRight: '5px' }} /> Register</Link></li>
                                </>
                            )}

                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

const styles = {
    // ... (rest of styles, remove gradient from navBtn definition)
    nav: {
        background: '#fff',
        padding: '1rem 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '0 80px 0 20px'
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#4a90e2'
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    link: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        color: '#333',
        fontWeight: '500'
    },
    btn: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        background: 'transparent',
        border: '1px solid #e74c3c',
        color: '#e74c3c',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    navBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        padding: '5px 15px',
        background: '#4a90e2',
        color: '#fff',
        borderRadius: '5px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: '0.3s',
        border: 'none',
        cursor: 'pointer'
    },
    bmiBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        background: 'transparent',
        border: 'none',
        color: '#333',
        padding: '0',
        borderRadius: '0',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '16px', // Match standard link font size if needed, or keep inherited
        fontFamily: 'inherit'
    }
};

export default Navbar;
