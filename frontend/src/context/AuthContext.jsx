import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const userInfo = localStorage.getItem('user');
        return userInfo ? JSON.parse(userInfo) : null;
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Validation/Refresh logic could go here if needed, but synchronous init is faster
        setLoading(false);
    }, []);

    const login = async (userData) => {
        // Clear guest data from previous users on the same machine
        const existingGuestProfile = localStorage.getItem('guest_profile_data');
        if (existingGuestProfile) {
            const parsed = JSON.parse(existingGuestProfile);
            if (parsed.email !== userData.email) {
                console.log('User mismatch, clearing guest data');
                localStorage.removeItem('guest_bmi_data');
                localStorage.removeItem('guest_profile_data');
            }
        }

        localStorage.setItem('user', JSON.stringify(userData));

        // Sync to guest storage for persistence after logout (re-sync current user)
        if (userData.bmi) {
            localStorage.setItem('guest_bmi_data', JSON.stringify({
                bmi: userData.bmi,
                category: userData.bmiCategory,
                date: userData.updatedAt || new Date().toLocaleDateString()
            }));
        }
        localStorage.setItem('guest_profile_data', JSON.stringify(userData));

        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        // window.location.replace('/'); // Removed to allow client-side routing in components
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
