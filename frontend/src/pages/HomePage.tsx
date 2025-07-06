// src/pages/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/page/HomePage.css';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => navigate('/login');
    const handleRegisterClick = () => navigate('/register');

    return (
        <div className="home-container">
            <div className="home-content">
                <h1>ระบบแจ้งเหตุฉุกเฉินในมหาวิทยาลัย</h1>
                <p>โปรดเข้าสู่ระบบหรือสมัครสมาชิกเพื่อใช้งานระบบ</p>
                <div className="home-buttons">
                    <button onClick={handleLoginClick}>เข้าสู่ระบบ</button>
                    <button onClick={handleRegisterClick} className="secondary">สมัครสมาชิก</button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
