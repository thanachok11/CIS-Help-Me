// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/page/RegisterPage.css';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        phone: '',
        residence: '',
        password: '',
    });

    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, formData);
            alert('สมัครสมาชิกสำเร็จ!');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>สมัครสมาชิก</h2>
                <form onSubmit={handleRegister}>
                    <label>ชื่อ-นามสกุล</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />

                    <label>รหัสนักศึกษา</label>
                    <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} required />

                    <label>เบอร์โทร</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />

                    <label>สถานที่พัก</label>
                    <input type="text" name="residence" value={formData.residence} onChange={handleChange} required />

                    <label>รหัสผ่าน</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />

                    {error && <p className="error-text">{error}</p>}

                    <button type="submit">สมัครสมาชิก</button>
                </form>

                <p className="login-link">มีบัญชีแล้ว? <a href="/login">เข้าสู่ระบบ</a></p>
            </div>
        </div>
    );
};

export default RegisterPage;
