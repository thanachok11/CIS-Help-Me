// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/page/LoginPage.css';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
                studentId,
                password,
            });

            const { token } = response.data;
            localStorage.setItem('token', token);
            navigate('/report');
        } catch (err: any) {
            setError(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>เข้าสู่ระบบ</h2>
                <form onSubmit={handleLogin}>
                    <label>รหัสนักศึกษา</label>
                    <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        required
                    />
                    <label>รหัสผ่าน</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="error-text">{error}</p>}
                    <button type="submit">เข้าสู่ระบบ</button>
                </form>
                <p className="register-link">
                    ยังไม่มีบัญชี? <a href="/register">สมัครสมาชิก</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
