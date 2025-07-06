import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { jwtDecode } from "jwt-decode";
import '../styles/page/AllReportsPage.css';

interface Report {
    _id: string;
    userId: string;
    type: string;
    description: string;
    locationText: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
    status: string;
    createdAt: string;
}

interface TokenPayload {
    userId: string;
    name: string;
    studentId: string;
    role: string;
    profile_img: string;
    iat: number;
    exp: number;
}

const containerStyle = {
    width: '100%',
    height: '250px',
};


const AllReportsPage: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const token = localStorage.getItem('token');

    let tokenPayload: TokenPayload | null = null;
    if (token) {
        try {
            tokenPayload = jwtDecode<TokenPayload>(token);
        } catch (e) {
            console.error('Token decode error:', e);
        }
    }

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    });

    const fetchReports = async () => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/reports/all`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setReports(res.data.reports);
        } catch (error) {
            console.error('Error fetching reports:', error);
            alert('❌ เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            alert('กรุณาเข้าสู่ระบบ');
            return;
        }
        fetchReports();
    }, [token]);

    const handleNavigate = (destLat: number, destLng: number) => {
        if (!navigator.geolocation) {
            alert('อุปกรณ์ของคุณไม่รองรับการระบุตำแหน่ง');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const originLat = pos.coords.latitude;
                const originLng = pos.coords.longitude;

                const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}`;

                window.open(url, '_blank');
            },
            (err) => {
                console.error(err);
                alert('ไม่สามารถเข้าถึงตำแหน่งของคุณได้');
            }
        );
    };

    const handleChangeStatus = async (reportId: string, newStatus: string) => {
        if (!token) {
            alert('กรุณาเข้าสู่ระบบ');
            return;
        }
        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/reports/${reportId}/status`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert('✅ เปลี่ยนสถานะสำเร็จ');
            fetchReports();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('❌ เปลี่ยนสถานะไม่สำเร็จ');
        }
    };

    if (loading) return <div>กำลังโหลดข้อมูล...</div>;

    if (reports.length === 0)
        return <div>ยังไม่มีรายงานเหตุฉุกเฉิน</div>;

    return (
        <div className="myreports-container">
            <h2>📋 รายงานเหตุฉุกเฉินทั้งหมด (สำหรับเจ้าหน้าที่)</h2>
            <ul className="report-list">
                {reports.map((report) => {
                    const isMyReport =
                        tokenPayload?.userId === report.userId;

                    return (
                        <li key={report._id} className="report-item">
                            <div className="report-header">
                                <strong>ประเภท:</strong> {report.type} |{' '}
                                <strong>สถานะ:</strong>{' '}
                                <span
                                    className={`status ${report.status
                                        .replace(/\s+/g, '-')
                                        .toLowerCase()}`}
                                >
                                    {report.status}
                                </span>
                            </div>
                            <p>
                                <strong>ผู้แจ้ง:</strong>{' '}
                                {isMyReport
                                    ? `${tokenPayload?.name} (รหัสนักศึกษา ${tokenPayload?.studentId})`
                                    : 'ผู้ใช้คนอื่น'}
                            </p>
                            <p>
                                <strong>รายละเอียด:</strong> {report.description}
                            </p>
                            <p>
                                <strong>สถานที่:</strong> {report.locationText}
                            </p>
                            <p>
                                <strong>วันที่แจ้ง:</strong>{' '}
                                {new Date(report.createdAt).toLocaleString()}
                            </p>

                            {isLoaded && (
                                <div className="report-map">
                                    <GoogleMap
                                        mapContainerStyle={containerStyle}
                                        center={{
                                            lat: report.latitude,
                                            lng: report.longitude,
                                        }}
                                        zoom={15}
                                    >
                                        <Marker
                                            position={{
                                                lat: report.latitude,
                                                lng: report.longitude,
                                            }}
                                        />
                                    </GoogleMap>
                                </div>
                            )}

                            <button
                                onClick={() =>
                                    handleNavigate(report.latitude, report.longitude)
                                }
                                className="navigate-btn"
                            >
                                🗺️ นำทางไปยังจุดเกิดเหตุ
                            </button>

                            <div style={{ marginTop: '10px' }}>
                                <label>เปลี่ยนสถานะ: </label>{' '}
                                <select
                                    value={report.status}
                                    onChange={(e) =>
                                        handleChangeStatus(report._id, e.target.value)
                                    }
                                >
                                    <option value="กำลังตรวจสอบ">กำลังตรวจสอบ</option>
                                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                                    <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                                </select>
                            </div>

                            {report.imageUrl && (
                                <div className="report-image">
                                    <img
                                        src={report.imageUrl}
                                        alt="ภาพเหตุการณ์"
                                    />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default AllReportsPage;