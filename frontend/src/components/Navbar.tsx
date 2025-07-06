import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // ✅ สำคัญ: ต้องลง package jwt-decode
import UserDropdown from './UserDropdown';

import '../styles/components/Navbar.css';

interface DecodedToken {
    name?: string;
    username?: string;
    role: string;
    email?: string;
    profile_img?: string;
}

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [user, setUser] = useState<DecodedToken | null>(null);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setUser(decoded);
            } catch (error) {
                console.error('❌ Error decoding token:', error);
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleUserSettings = () => {
        navigate('/settingProfile');
    };

    const handleMenuClick = (path: string, label: string) => {
        console.log('Menu Click:', label);
        navigate(path);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <h2 className="logo">🚨 Emergency</h2>

                <ul className="nav-links">
                    {token && user ? (
                        <>
                            {/* เมนูสำหรับ staff */}
                            {user.role === 'staff' && (
                                <>
                                    <li><Link to="/all">หน้าแรก</Link></li>
                                    <li><Link to="/dashboard">รายงานสถิติ</Link></li>
                                    <li><Link to="/report">แจ้งเหตุ</Link></li>
                                </>
                            )}

                            {/* เมนูสำหรับ user ทั่วไป */}
                            {user.role === 'user' && (
                                <>
                                    <li><Link to="/my-reports">หน้าแรก</Link></li>
                                </>
                            )}

                            {/* เมนู dropdown ผู้ใช้ */}
                            <li>
                                <UserDropdown
                                    user={{
                                        username: user.username,
                                        name: user.name,
                                        profileImg: user.profile_img,
                                        role: user.role,
                                    }}
                                    onLogout={handleLogout}
                                    onUserSettings={handleUserSettings}
                                    onMenuClick={handleMenuClick}
                                />
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login">เข้าสู่ระบบ</Link></li>
                            <li><Link to="/register">สมัครสมาชิก</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
