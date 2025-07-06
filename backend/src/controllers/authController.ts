import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

// 🧾 แสดงผู้ใช้ทั้งหมด (เฉพาะ admin ดูได้)
export const showAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', error });
    }
};

// 📝 ลงทะเบียน (นักศึกษา/บุคลากร)
export const register = async (req: Request, res: Response): Promise<void> => {
    const { name, phone, studentId, residence, password } = req.body;

    try {
        const existingUser = await User.findOne({ studentId });

        if (existingUser) {
            res.status(400).json({ message: 'studentId นี้ถูกใช้งานแล้ว' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            phone,
            studentId,
            residence,
            password: hashedPassword,
            role: 'user',
            profile_img: 'https://res.cloudinary.com/dboau6axv/image/upload/v1735641179/qa9dfyxn8spwm0nwtako.jpg',
        });

        await newUser.save();

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ' });
        console.log(`New user registered: ${JSON.stringify(newUser, null, 2)}`);
    } catch (error) {
        res.status(500).json({ message: 'สมัครสมาชิกไม่สำเร็จ', error });
    }
};

// 🔐 เข้าสู่ระบบ
export const login = async (req: Request, res: Response): Promise<void> => {
    const { studentId, password } = req.body;

    try {
        const user = await User.findOne({ studentId });

        if (!user) {
            res.status(400).json({ message: 'ไม่พบผู้ใช้งานในระบบ' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
            return;
        }

        const token = jwt.sign(
            {
                userId: user._id,
                name: user.name,
                studentId: user.studentId,
                role: user.role,
                profile_img: user.profile_img,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '30m' }
        );

        res.status(200).json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: 'เข้าสู่ระบบไม่สำเร็จ', error });
    }
};

// 🔄 ต่ออายุ Token
export const renewToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const oldToken = authHeader.split(" ")[1];
        const decoded = jwt.verify(oldToken, process.env.JWT_SECRET as string) as any;

        const newToken = jwt.sign(
            {
                userId: decoded.userId,
                name: decoded.name,
                studentId: decoded.studentId,
                role: decoded.role,
                profile_img: decoded.profile_img,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "30m" }
        );

        res.status(200).json({ token: newToken });
    } catch (err) {
        res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
    }
};
