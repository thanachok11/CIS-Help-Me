import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import EmergencyReport from '../models/EmergencyReport';


export const getAllReports = async (req: Request, res: Response): Promise<void> => {
    try {
        // ดึงข้อมูลเหตุการณ์ล่าสุดเรียงตามวันที่สร้าง
        const reports = await EmergencyReport.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ success: false, message: 'Error fetching reports' });
    }
};

// อัปเดตสถานะและบันทึกการช่วยเหลือ
export const updateReportStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const reportId = req.params.id;
        const { status, actionNotes } = req.body;

        if (!['รอการตอบสนอง', 'กำลังดำเนินการ', 'เสร็จสิ้น'].includes(status)) {
            res.status(400).json({ success: false, message: 'สถานะไม่ถูกต้อง' });
            return;
        }

        const report = await EmergencyReport.findById(reportId);
        if (!report) {
            res.status(404).json({ success: false, message: 'ไม่พบรายงานเหตุการณ์' });
            return;
        }

        report.status = status;
        if (actionNotes) {
            report.actionNotes = actionNotes;
        }

        await report.save();

        res.status(200).json({ success: true, message: 'อัปเดตสถานะเรียบร้อย', report });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ success: false, message: 'Error updating report' });
    }
};

export const getNewReports = async (req: Request, res: Response): Promise<void> => {
    try {
        const since = new Date(req.query.since as string);
        const newReports = await EmergencyReport.find({ createdAt: { $gt: since } });

        res.status(200).json({ success: true, reports: newReports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching new reports' });
    }
};



export const getReportByType = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await EmergencyReport.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
};

export const getResponseStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
        const resolvedReports = await EmergencyReport.find({ status: 'เสร็จสิ้น' });

        const responseTimes = resolvedReports.map(r => {
            const created = new Date(r.createdAt).getTime();
            const updated = new Date(r.updatedAt).getTime();
            return (updated - created) / (1000 * 60); // นาที
        });

        const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0;

        res.status(200).json({ success: true, averageResponseTime: avgTime.toFixed(2), unit: "minutes" });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error calculating response times' });
    }
};

export const getReportsSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. รวมจำนวนเหตุฉุกเฉินตามประเภท
        const countByTypeRaw = await EmergencyReport.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        const totalReports = countByTypeRaw.reduce((sum, item) => sum + item.count, 0);

        const countByType = countByTypeRaw.map(item => ({
            type: item._id,
            displayName: translateType(item._id),
            count: item.count,
            percentage: ((item.count / totalReports) * 100).toFixed(2)
        }));

        // 2. คำนวณเวลาตอบสนองเฉลี่ย (เฉพาะรายการที่เสร็จสิ้น)
        const resolvedReports = await EmergencyReport.find({ status: 'เสร็จสิ้น' });

        const responseTimes = resolvedReports.map(r => {
            const created = new Date(r.createdAt).getTime();
            const updated = new Date(r.updatedAt).getTime();
            return (updated - created) / (1000 * 60); // นาที
        });

        const avgTime = responseTimes.length
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;

        // 3. สร้าง detailedReports แสดงข้อมูลแต่ละเหตุการณ์
        const detailedReports = resolvedReports.map(r => {
            const responseTime = ((new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60)).toFixed(2);
            return {
                id: r._id,
                type: r.type,
                description: r.description || '-',
                createdAt: r.createdAt,
                resolvedAt: r.updatedAt,
                responseTime,
            };
        });

        // ส่งข้อมูลออกไป
        res.status(200).json({
            success: true,
            summary: {
                totalReports,
                countByType,
                averageResponseTime: {
                    value: Number(avgTime.toFixed(2)),
                    unit: 'minutes'
                },
                detailedReports
            }
        });
    } catch (error) {
        console.error('Error fetching report summary:', error);
        res.status(500).json({ success: false, message: 'Error fetching report summary' });
    }
};
const translateType = (type: string): string => {
    const typeMap: { [key: string]: string } = {
        fire: 'เหตุเพลิงไหม้',
        accident: 'อุบัติเหตุ',
        medical: 'เหตุทางการแพทย์',
        test: 'ทดสอบระบบ',
        other: 'เหตุอื่น ๆ'
    };
    return typeMap[type] || type;
};
