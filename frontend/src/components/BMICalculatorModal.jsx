import React, { useState, useContext } from 'react';
import { X, Calculator } from 'lucide-react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const BMICalculatorModal = ({ isOpen, onClose }) => {
    const { user, setUser } = useContext(AuthContext);
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState(null);
    const [category, setCategory] = useState('');

    if (!isOpen) return null;

    const calculateBMI = (e) => {
        e.preventDefault();
        if (height && weight) {
            const heightInMeters = height / 100;
            const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
            setBmi(bmiValue);

            let cat = '';
            if (bmiValue < 18.5) cat = 'Underweight';
            else if (bmiValue < 25) cat = 'Normal weight';
            else if (bmiValue < 30) cat = 'Overweight';
            else cat = 'Obese';
            setCategory(cat);

            // Save to profile
            saveBMIToProfile(bmiValue, cat);
        }
    };

    const saveBMIToProfile = async (bmiValue, bmiCategory) => {
        try {
            const res = await api.put('/users/profile', {
                bmi: parseFloat(bmiValue),
                bmiCategory
            });
            // Update local user context
            const updatedUser = { ...user, bmi: parseFloat(bmiValue), bmiCategory };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Persist for guest view (after logout)
            localStorage.setItem('guest_bmi_data', JSON.stringify({
                bmi: bmiValue,
                category: bmiCategory,
                date: new Date().toLocaleDateString()
            }));

            if (setUser) setUser(updatedUser);
        } catch (err) {
            console.error('Error saving BMI:', err);
        }
    };

    const resetAndClose = () => {
        setHeight('');
        setWeight('');
        setBmi(null);
        setCategory('');
        onClose();
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}><Calculator size={24} /> BMI Calculator</h2>
                    <button onClick={resetAndClose} style={styles.closeBtn}><X size={24} /></button>
                </div>

                <form onSubmit={calculateBMI} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Height (cm)</label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Weight (kg)</label>
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    <button type="submit" style={styles.submitBtn}>Calculate BMI</button>
                </form>

                {bmi && (
                    <div style={styles.result}>
                        <h3 style={styles.bmiValue}>Your BMI: {bmi}</h3>
                        <p style={{ ...styles.category, color: getCategoryColor(category) }}>Category: {category}</p>
                    </div>
                )}
            </div>
        </div>
    );
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

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        position: 'relative'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
    },
    title: {
        fontSize: '1.5rem',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#4a90e2'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#666'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: '#444'
    },
    input: {
        padding: '10px',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '1rem'
    },
    submitBtn: {
        backgroundColor: '#4a90e2',
        color: '#fff',
        padding: '12px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '0.5rem',
        transition: 'background 0.3s'
    },
    result: {
        marginTop: '1.5rem',
        padding: '1rem',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        textAlign: 'center'
    },
    bmiValue: {
        margin: '0 0 0.5rem 0',
        fontSize: '1.2rem'
    },
    category: {
        margin: 0,
        fontWeight: 'bold',
        fontSize: '1.1rem'
    }
};

export default BMICalculatorModal;
