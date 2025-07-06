import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    residence: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profile_img: { type: String },
});

export default mongoose.model('User', userSchema);
