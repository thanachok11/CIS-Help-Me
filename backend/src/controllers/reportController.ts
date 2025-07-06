import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import EmergencyReport from '../models/EmergencyReport';

export const createReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, description, locationText, latitude, longitude } = req.body;
        const userId = (req as any).user.userId;

        // ✅ ตรวจสอบข้อมูลที่จำเป็น
        if (!type || !description || !locationText || !latitude || !longitude) {
            res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ' });
            return;
        }

        // ✅ ตรวจสอบ userId จาก token
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized: ไม่พบข้อมูลผู้ใช้' });
            console.log("userId",userId);
            return;
        }

        // ✅ หากมีรูปภาพ
        if (req.file) {
            cloudinary.uploader.upload_stream(
                { resource_type: 'auto' },
                async (err, result) => {
                    if (err || !result) {
                        console.error(err);
                        res.status(500).json({ success: false, message: 'Error uploading image' });
                        return;
                    }

                    const newReport = new EmergencyReport({
                        userId,
                        type,
                        description,
                        locationText,
                        latitude,
                        longitude,
                        imageUrl: result.secure_url,
                        status: 'กำลังตรวจสอบ',
                        createdAt: new Date(),
                    });

                    await newReport.save();
                    console.log("รายงานเหตุฉุกเฉินถูกสร้างโดย:", userId);
                    res.status(201).json({ success: true, report: newReport });
                }
            ).end(req.file.buffer);
        } else {
            // ✅ หากไม่มีรูปภาพ
            const newReport = new EmergencyReport({
                userId,
                type,
                description,
                locationText,
                latitude,
                longitude,
                status: 'กำลังตรวจสอบ',
                createdAt: new Date(),
            });

            await newReport.save();
            console.log("✅ รายงานเหตุฉุกเฉินถูกสร้างโดย:", userId);
            res.status(201).json({ success: true, report: newReport });
        }
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการแจ้งเหตุ:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getMyReports = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.userId;
        const myReports = await EmergencyReport.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, reports: myReports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching reports' });
    }
};