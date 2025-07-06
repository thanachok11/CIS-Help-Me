import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/page/AdminDashboard.css";

// แต่ละรายการเหตุการณ์
interface DetailedReport {
    id: string;
    type: string;
    description: string;
    createdAt: string;
    resolvedAt: string;
    responseTime: string;  // นาที
}

// สรุปรายงานที่ได้จาก backend
interface SummaryResponse {
    summary: {
        totalReports: number;
        countByType: {
            type: string;
            displayName: string;
            count: number;
            percentage: string;
        }[];
        averageResponseTime: {
            value: number;
            unit: string;
        };
        detailedReports: DetailedReport[];
    };
}

const ReportSummary: React.FC = () => {
    const [summary, setSummary] = useState<SummaryResponse['summary'] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return alert('กรุณาเข้าสู่ระบบ');

        axios.get(`${process.env.REACT_APP_API_URL}/reports/summary`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (res.data.success) {
                    setSummary(res.data.summary);
                } else {
                    alert('เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ');
                }
            })
            .catch(() => alert('ไม่สามารถโหลดข้อมูลได้'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>กำลังโหลดข้อมูล...</p>;
    if (!summary) return <p>ไม่มีข้อมูลสถิติ</p>;

    return (
        <div className="report-summary-container">
            <h2>รายงานและสถิติ</h2>

            <section>
                <h3>จำนวนเหตุฉุกเฉินทั้งหมด: {summary.totalReports} รายการ</h3>
                <ul>
                    {summary.countByType.map(item => (
                        <li key={item.type}>
                            {item.displayName} ({item.type}): {item.count} ครั้ง ({item.percentage}%)
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h3>
                    เวลาตอบสนองเฉลี่ย: {summary.averageResponseTime.value}{" "}
                    {summary.averageResponseTime.unit}
                </h3>
            </section>

            <section>
                <h3>รายละเอียดเหตุการณ์ที่เสร็จสิ้น</h3>
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>ประเภท</th>
                                <th>รายละเอียด</th>
                                <th>วันที่แจ้ง</th>
                                <th>วันที่เสร็จสิ้น</th>
                                <th>เวลาตอบสนอง (นาที)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.detailedReports.map((report) => (
                                <tr key={report.id}>
                                    <td>{report.type}</td>
                                    <td>{report.description}</td>
                                    <td>{new Date(report.createdAt).toLocaleString()}</td>
                                    <td>{new Date(report.resolvedAt).toLocaleString()}</td>
                                    <td>{report.responseTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default ReportSummary;
