import express from 'express';
import multer from 'multer';
import { createReport, getMyReports, } from '../controllers/reportController';
import { verifyToken } from '../middlewares/auth';
import { getAllReports, updateReportStatus,  getNewReports, getReportByType, getResponseStatistics,getReportsSummary } from '../controllers/staffController';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // ใช้ buffer สำหรับ upload_stream

router.post('/create', verifyToken, upload.single('image'), createReport);
router.put('/:id/status', verifyToken, updateReportStatus);
router.get('/all', verifyToken, getAllReports);


router.get('/new', verifyToken, getNewReports);         // ดูเหตุใหม่
router.get('/my-reports', verifyToken, getMyReports);           // ของผู้ใช้
router.get('/statistics/type', verifyToken, getReportByType);   // สถิติตามประเภท
router.get('/statistics/response-time', verifyToken, getResponseStatistics); // เวลาตอบสนอง
router.get('/summary', verifyToken, getReportsSummary); // เวลาตอบสนอง

export default router;
