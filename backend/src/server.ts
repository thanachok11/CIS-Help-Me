import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import reportRoutes from './routes/reportRoutes';
import connectDB from './utils/database';

import authRoutes from './routes/authRoutes';


const app = express();
const PORT: number = Number(process.env.PORT) || 5000;
connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://192.168.1.153:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());





app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

