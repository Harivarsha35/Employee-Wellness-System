import { useEffect } from 'react';

const Home = () => {


    return (
        <div style={styles.hero}>
            <h1>Welcome to Employee Wellness System</h1>
            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '30px' }}>Track your health, stay active, and boost productivity.</p>

            <div style={{ textAlign: 'left', marginTop: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
                <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '15px' }}>Employee Wellness</h3>
                <p style={{ lineHeight: '1.6', color: '#34495e' }}>
                    Employee wellness is key to a happy and productive workplace. Our system creates a supportive environment that encourages healthy habits.
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '15px', color: '#444' }}>
                    <li style={{ marginBottom: '8px' }}>Monitor daily physical activities and health metrics.</li>
                    <li style={{ marginBottom: '8px' }}>Set and achieve personal wellness goals.</li>
                    <li style={{ marginBottom: '8px' }}>Access resources for mental and physical well-being.</li>
                    <li style={{ marginBottom: '8px' }}>Stay engaged with team challenges and progress tracking.</li>
                    <li style={{ marginBottom: '8px' }}>Improve work-life balance through personalized activity schedules.</li>
                    <li style={{ marginBottom: '8px' }}>Reduce stress with guided mindfulness and relaxation techniques.</li>

                    <li>Track hydration and sleep patterns for holistic health management.</li>
                </ul>
            </div>
        </div>
    );
};

const styles = {
    hero: {
        textAlign: 'center',
        padding: '50px 20px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        margin: '50px auto'
    }
};

export default Home;
