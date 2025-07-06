import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/page/MyReportsPage.css';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import {jwtDecode} from 'jwt-decode';

interface Report {
    _id: string;
    userId: string; // เพิ่ม userId เพื่อเปรียบเทียบ
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
    // เพิ่มตามโครงสร้าง token จริงของคุณ
}

const containerStyle = {
    width: '100%',
    height: '250px',
};

const MyReportsPage: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const token = localStorage.getItem('token');
    const [userId, setUserId] = useState<string | null>(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    });

    // Decode token เพื่อดึง userId
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode<TokenPayload>(token);
                setUserId(decoded.userId);
            } catch (error) {
                console.error('Token decode error:', error);
            }
        }
    }, [token]);

    useEffect(() => {
        if (!token) {
            alert('กรุณาเข้าสู่ระบบ');
            return;
        }

        const fetchReports = async () => {
            try {
                const res = await axios.get(
                    `${process.env.REACT_APP_API_URL}/reports/my-reports`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                // กรองรายงานเฉพาะของ userId ที่ตรงกัน
                if (userId) {
                    const filteredReports = res.data.reports.filter(
                        (r: Report) => r.userId === userId
                    );
                    setReports(filteredReports);
                } else {
                    setReports([]);
                }
            } catch (error) {
                console.error('Error fetching reports:', error);
                alert('❌ เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [token, userId]);

    
    if (loading) return <div>กำลังโหลดข้อมูล...</div>;

    if (reports.length === 0)
        return <div>ยังไม่มีรายงานเหตุฉุกเฉินของคุณ</div>;

    return (
        <div className="myreports-container">
            <h2>รายงานเหตุฉุกเฉินของฉัน</h2>
            <ul className="report-list">
                {reports.map((report) => (
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

                        {report.imageUrl && (
                            <div className="report-image">
                                <img
                                    src={report.imageUrl}
                                    alt="ภาพเหตุการณ์"
                                />
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyReportsPage;
