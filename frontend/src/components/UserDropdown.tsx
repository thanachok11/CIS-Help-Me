// src/components/UserDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/components/UserDropdown.css';
interface UserDropdownProps {
    user: {
        username?: string;
        name?: string;
        profileImg?: string;
        role: string;
    };
    onLogout: () => void;
    onUserSettings: () => void;
    onMenuClick: (path: string, label: string) => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout, onUserSettings, onMenuClick }) => {
    const [userDropdown, setUserDropdown] = useState(false);
    const [confirmLogout, setConfirmLogout] = useState(false);
    const userRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userRef.current && !userRef.current.contains(event.target as Node)) {
                setUserDropdown(false);
                setConfirmLogout(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogoutClick = () => {
        setConfirmLogout(true);
    };

    const confirmLogoutYes = () => {
        setConfirmLogout(false);
        setUserDropdown(false);
        onLogout();
    };

    const confirmLogoutNo = () => {
        setConfirmLogout(false);
    };

    return (
        <div
            className="user-dropdown"
            ref={userRef}
            onClick={() => {
                setUserDropdown(!userDropdown);
                setConfirmLogout(false);
            }}
            style={{ position: 'relative' }}
        >
            <div className="user-info">
                <img src={user.profileImg || '/default-avatar.png'} alt="User" className="avatar" />
                <div className="user-details">
                    <span className="username">{user?.username || user?.name}</span>
                    <span className="status-online">🟢 กำลังออนไลน์</span>
                </div>
                <FontAwesomeIcon icon={faCaretDown} className="icon caret-icon" />
            </div>

            {userDropdown && (
                <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
                    {!confirmLogout ? (
                        <>
                            <p className="user-role">👤 Role: {user.role}</p>
                            <button onClick={handleLogoutClick} className="logout-button">
                                <FontAwesomeIcon icon={faSignOutAlt} className="icon logout-icon" /> ออกจากระบบ
                            </button>
                        </>
                    ) : (
                        <div className="confirm-logout">
                            <p>คุณต้องการออกจากระบบหรือไม่?</p>
                            <button onClick={confirmLogoutYes} className="confirm-yes">ใช่</button>
                            <button onClick={confirmLogoutNo} className="confirm-no">ไม่</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
