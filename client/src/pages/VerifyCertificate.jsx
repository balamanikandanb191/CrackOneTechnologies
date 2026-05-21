import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSearch, FaCertificate } from 'react-icons/fa';
import './VerifyCertificate.css';

const VerifyCertificate = () => {
    const [certificateId, setCertificateId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!certificateId.trim()) {
            setError("Please enter a valid certificate number");
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Using absolute URL for development/production
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.get(`${API_URL}/api/certificates/${certificateId.trim()}`);
            
            if (response.data.success) {
                setResult(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid Certificate Number or Server Error");
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-page">
            <div className="verify-header">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>Verify Your Certificate</h1>
                    <p>Enter your unique certificate number to verify its authenticity.</p>
                </motion.div>
            </div>

            <div className="verify-container">
                <motion.div 
                    className="verify-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <form onSubmit={handleVerify} className="verify-form">
                        <div className="input-group">
                            <FaCertificate className="input-icon" />
                            <input
                                type="text"
                                placeholder="e.g. COT26XXA01"
                                value={certificateId}
                                onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                            />
                            <button type="submit" disabled={loading} className="verify-btn">
                                {loading ? 'Verifying...' : <><FaSearch /> Verify</>}
                            </button>
                        </div>
                        {error && <p className="error-text"><FaTimesCircle /> {error}</p>}
                    </form>

                    {result && (
                        <motion.div 
                            className="result-card success"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="result-header">
                                <FaCheckCircle className="success-icon" />
                                <h2>Verified Successfully!</h2>
                            </div>
                            <div className="result-details">
                                <div className="detail-row">
                                    <span className="label">Certificate ID:</span>
                                    <span className="value highlight">{result.certificateId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Recipient Name:</span>
                                    <span className="value">{result.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Course/Program:</span>
                                    <span className="value">{result.course}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Issue Date:</span>
                                    <span className="value">
                                        {new Date(result.issueDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div className="watermark">CRACKONE TECHNOLOGIES</div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default VerifyCertificate;
