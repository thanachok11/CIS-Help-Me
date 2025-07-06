import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // <-- import useNavigate

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import '../styles/page/ReportPage.css';

const containerStyle = {
    width: '100%',
    height: '350px',
};

const defaultCenter = {
    lat: 13.736717,
    lng: 100.523186,
};

const ReportPage: React.FC = () => {
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [locationText, setLocationText] = useState('');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [center, setCenter] = useState<{ lat: number; lng: number }>({
        lat: 13.736717, // fallback default: Bangkok
        lng: 100.523186,
    });


    const navigate = useNavigate();  // <-- ใช้ useNavigate

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    });
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setCenter({ lat, lng });
                    setLatitude(lat);
                    setLongitude(lng);
                },
                (err) => {
                    console.warn("❌ ไม่สามารถเข้าถึงตำแหน่งผู้ใช้:", err);
                }
            );
        }
    }, []);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setLatitude(lat);
            setLongitude(lng);
        }
    }, []);

    const geocodeLocation = async () => {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationText)}&key=${apiKey}`;

        try {
            const res = await axios.get(url);
            const { results } = res.data;
            if (results.length > 0) {
                const { lat, lng } = results[0].geometry.location;
                setLatitude(lat);
                setLongitude(lng);
                setCenter({ lat, lng });
            } else {
                alert('❌ ไม่พบตำแหน่งจากสถานที่ที่ระบุ');
            }
        } catch (err) {
            console.error('Geocode error:', err);
            alert('❌ เกิดข้อผิดพลาดในการค้นหาตำแหน่ง');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) return alert('กรุณาเข้าสู่ระบบ');

        if (!type || !description || latitude === null || longitude === null) {
            return alert('กรุณากรอกประเภท, รายละเอียด และตำแหน่งบนแผนที่');
        }

        const actualLocationText = locationText.trim() || 'ตำแหน่งจากแผนที่';

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('type', type);
            formData.append('description', description);
            formData.append('locationText', actualLocationText);
            formData.append('latitude', latitude.toString());
            formData.append('longitude', longitude.toString());
            if (image) formData.append('image', image);

            const res = await axios.post(
                'http://localhost:5000/api/reports/create',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert('✅ แจ้งเหตุสำเร็จ');
            console.log(res.data);
            navigate('/my-reports'); // ปรับ path ตามหน้าแสดงรายการที่คุณสร้างไว้

        } catch (error) {
            alert('❌ แจ้งเหตุไม่สำเร็จ');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="report-container">
            <h2>📢 แจ้งเหตุฉุกเฉิน</h2>
            <form onSubmit={handleSubmit} className="report-form">
                <label>ประเภทเหตุ:</label>
                <input
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="เช่น ไฟไหม้, จมน้ำ"
                />

                <label>รายละเอียดเหตุการณ์:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <label>สถานที่เกิดเหตุ (ข้อความ):</label>
                <div className="location-search">
                    <input
                        value={locationText}
                        onChange={(e) => setLocationText(e.target.value)}
                        placeholder="เช่น มหาวิทยาลัย, บางนา, กรุงเทพ"
                    />
                    <button type="button" onClick={geocodeLocation}>
                        ค้นหา
                    </button>
                </div>

                <label>แผนที่เกิดเหตุ (คลิกเพื่อระบุตำแหน่ง):</label>
                {isLoaded && (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={15}
                        onClick={onMapClick}
                    >
                        {latitude && longitude && (
                            <Marker position={{ lat: latitude, lng: longitude }} />
                        )}
                    </GoogleMap>
                )}
                <label>แนบรูปภาพ (ถ้ามี):</label>
                <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />

                <button type="submit" disabled={loading}>
                    {loading ? 'กำลังส่ง...' : 'แจ้งเหตุ'}
                </button>
            </form>
        </div>
    );
};

export default ReportPage;
