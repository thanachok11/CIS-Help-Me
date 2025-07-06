import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface CustomJwtPayload extends JwtPayload {
    userId: string;
    name: string;
    studentId: string;
    role: string;
    profile_img: string;
}


export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({ success: false, message: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;
        (req as any).user = decoded;   
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
