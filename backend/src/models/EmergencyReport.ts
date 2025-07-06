import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyReport extends Document {
    _id: string;
    userId: string;
    type: string;
    description: string;
    locationText: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
    status: 'รอการตอบสนอง' | 'กำลังดำเนินการ' | 'เสร็จสิ้น';
    actionNotes?: string;  // บันทึกช่วยเหลือ
    createdAt: Date;
    updatedAt: Date;
}

const EmergencyReportSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, required: true },
        description: { type: String, required: true },
        locationText: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        imageUrl: { type: String },
        status: {
            type: String, enum: ['กำลังตรวจสอบ', 'กำลังดำเนินการ', 'เสร็จสิ้น'], 
            default: 'กำลังตรวจสอบ' },
        actionNotes: { type: String, default: '' },
    },
    { timestamps: true }
);

export default mongoose.model<IEmergencyReport>('EmergencyReport', EmergencyReportSchema);
