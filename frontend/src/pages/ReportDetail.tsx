// src/pages/ReportDetail.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Log {
    date: string;
    note: string;
}

interface Report {
    _id: string;
    type: string;
    description: string;
    locationText: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
    status: string;
    logs: Log[];
    createdAt: string;
}

const ReportDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState('');
    const [status, setStatus] = useState('');

    const fetchReport = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/reports`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const foundReport = res.data.reports.find((r: Report) => r._id === id);
            if (foundReport) {
                setReport(foundReport);
                setStatus(foundReport.status);
            } else {
                alert('ไม่พบรายงานเหตุการณ์นี้');
            }
        } catch (error) {
            alert('โหลดข้อมูลไม่สำเร็จ');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [id]);

    const handleAddLog = async () => {
        if (!newNote.trim()) return alert('กรุณากรอกบันทึก');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `http://localhost:5000/api/reports/${id}/log`,
                { note: newNote },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReport(res.data.report);
            setNewNote('');
            alert('บันทึกช่วยเหลือสำเร็จ');
        } catch (error) {
            alert('บันทึกช่วยเหลือไม่สำเร็จ');
            console.error(error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:5000/api/reports/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus(newStatus);
            alert('อัพเดตสถานะสำเร็จ');
        } catch (error) {
            alert('อัพเดตสถานะไม่สำเร็จ');
            console.error(error);
        }
    };

    if (loading) return <p>กำลังโหลดข้อมูล...</p>;

    if (!report) return <p>ไม่พบข้อมูลเหตุการณ์</p>;

    return (
        <div className="report-detail-container">
            <h2>รายละเอียดเหตุฉุกเฉิน</h2>
            <p><strong>ประเภทเหตุ:</strong> {report.type}</p>
            <p><strong>รายละเอียด:</strong> {report.description}</p>
            <p><strong>สถานที่:</strong> {report.locationText}</p>
            <p><strong>วันที่แจ้ง:</strong> {new Date(report.createdAt).toLocaleString()}</p>
            {report.imageUrl && (
                <img src={report.imageUrl} alt="ภาพเหตุการณ์" style={{ maxWidth: '300px' }} />
            )}

            <div>
                <label>สถานะ:</label>
                <select value={status} onChange={(e) => handleStatusChange(e.target.value)}>
                    <option value="รอการตอบสนอง">รอการตอบสนอง</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                    <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                </select>
            </div>

            <h3>บันทึกการช่วยเหลือ</h3>
            <ul>
                {report.logs.map((log, idx) => (
                    <li key={idx}>
                        <strong>{new Date(log.date).toLocaleString()}:</strong> {log.note}
                    </li>
                ))}
            </ul>

            <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="เพิ่มบันทึกการช่วยเหลือ"
            />
            <button onClick={handleAddLog}>บันทึก</button>
        </div>
    );
};

export default ReportDetail;
