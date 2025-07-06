import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReportPage from './pages/ReportPage';
import MyReportsPage from './pages/MyReportsPage';
import AllReportsPage from './pages/AllReportsPage';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import "./App.css";

// ✅ Interceptor: หาก token หมดอายุ ให้ logout และ redirect
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/"; // กลับไปหน้า login
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/report' element={<ReportPage />} />
        <Route path='/my-reports' element={<MyReportsPage />} />
        <Route path='/all' element={<AllReportsPage />} />

        <Route path='/dashboard' element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
