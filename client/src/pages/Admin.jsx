import { useState, useEffect } from 'react'
import { FaUsers, FaProjectDiagram, FaEnvelope, FaChartBar, FaPlus, FaEye, FaEdit, FaTrash, FaBolt, FaCertificate } from 'react-icons/fa'
import './Admin.css'

const Admin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isLoginMode, setIsLoginMode] = useState(true)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [authData, setAuthData] = useState({ name: '', email: '', password: '' })
    const [authError, setAuthError] = useState('')
    const [authSuccess, setAuthSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    
    const [contacts, setContacts] = useState([])
    const [stats, setStats] = useState({ totalContacts: 0, totalProjects: 0, totalClients: 0, monthlyVisits: 0 })

    // Certificate Form State
    const [certForm, setCertForm] = useState({ certificateId: '', name: '', course: '', issueDate: '' })
    const [certStatus, setCertStatus] = useState({ type: '', message: '' })

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/api/auth/verify`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.success) {
                        setIsLoggedIn(true);
                    } else {
                        localStorage.removeItem('adminToken');
                    }
                } catch (err) {
                    localStorage.removeItem('adminToken');
                }
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchContacts();
        }
    }, [isLoggedIn])

    const fetchContacts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/contact`);
            const data = await response.json();
            if (data.success) {
                setContacts(data.data);
                setStats({ 
                    totalContacts: data.data.length, 
                    totalProjects: 0, 
                    totalClients: 0, 
                    monthlyVisits: 0 
                });
            }
        } catch (err) {
            console.error("Failed to fetch contacts", err);
        }
    }

    const handleDeleteContact = async (id) => {
        if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
        try {
            const response = await fetch(`${API_URL}/api/contact/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                setContacts(contacts.filter(c => c.contactId !== id));
                setStats(prev => ({ ...prev, totalContacts: prev.totalContacts - 1 }));
            } else {
                alert("Failed to delete contact");
            }
        } catch (err) {
            console.error("Error deleting contact", err);
            alert("Server error while deleting");
        }
    }

    const handleAuth = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');
        setIsLoading(true);

        const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
        const payload = isLoginMode 
            ? { email: authData.email, password: authData.password }
            : { name: authData.name, email: authData.email, password: authData.password };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                if (isLoginMode) {
                    localStorage.setItem('adminToken', data.data.token);
                    setIsLoggedIn(true);
                } else {
                    setAuthSuccess("Registration successful! Please login.");
                    setIsLoginMode(true);
                    setAuthData({ ...authData, password: '' });
                }
            } else {
                setAuthError(data.error || 'Authentication failed');
            }
        } catch (err) {
            setAuthError('Server connection error. Please ensure backend is running.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsLoggedIn(false);
    }

    const handleAddCertificate = async (e) => {
        e.preventDefault()
        setCertStatus({ type: 'loading', message: 'Adding certificate...' })
        try {
            const response = await fetch(`${API_URL}/api/certificates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(certForm)
            })
            const data = await response.json()
            if (data.success) {
                setCertStatus({ type: 'success', message: 'Certificate added successfully!' })
                setCertForm({ certificateId: '', name: '', course: '', issueDate: '' })
            } else {
                setCertStatus({ type: 'error', message: data.message || 'Failed to add certificate' })
            }
        } catch (error) {
            setCertStatus({ type: 'error', message: 'Server error. Could not connect.' })
        }
        setTimeout(() => setCertStatus({ type: '', message: '' }), 4000)
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
        { id: 'contacts', label: 'Contacts', icon: <FaEnvelope /> },
        { id: 'projects', label: 'Projects', icon: <FaProjectDiagram /> },
        { id: 'clients', label: 'Clients', icon: <FaUsers /> },
        { id: 'certificates', label: 'Certificates', icon: <FaCertificate /> }
    ]

    if (!isLoggedIn) {
        return (
            <div className="admin-page">
                <div className="admin-login-wrapper">
                    <div className="admin-login-card glass-card">
                        <div className="login-logo"><FaBolt className="login-bolt" /><span>CrackOne</span></div>
                        <h2>{isLoginMode ? 'Admin Login' : 'Admin Sign Up'}</h2>
                        <form onSubmit={handleAuth} className="login-form">
                            {!isLoginMode && (
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input type="text" value={authData.name} onChange={(e) => setAuthData({ ...authData, name: e.target.value })} required />
                                </div>
                            )}
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <input type="password" value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} required />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Processing...' : (isLoginMode ? 'Login' : 'Sign Up')}
                            </button>
                        </form>
                        
                        {authError && <p style={{ color: '#ef4444', marginTop: '10px', fontWeight: 'bold' }}>{authError}</p>}
                        {authSuccess && <p style={{ color: '#22c55e', marginTop: '10px', fontWeight: 'bold' }}>{authSuccess}</p>}

                        <p className="demo-note" style={{ marginTop: '20px', cursor: 'pointer', color: '#2563eb' }} onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); setAuthSuccess(''); }}>
                            {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                <aside className="admin-sidebar">
                    <div className="sidebar-header"><FaBolt /><span>Admin</span></div>
                    <nav className="sidebar-nav">
                        {tabs.map((tab) => (
                            <button key={tab.id} className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                                {tab.icon}<span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </aside>
                <main className="admin-main">
                    <header className="admin-header">
                        <h1>{tabs.find(t => t.id === activeTab)?.label}</h1>
                        <button className="btn btn-primary" onClick={() => setActiveTab('certificates')}><FaPlus /> Add New</button>
                    </header>
                    <div className="admin-content">
                        {activeTab === 'dashboard' && (
                            <>
                                <div className="stats-grid">
                                    <div className="stat-card"><div className="stat-icon"><FaEnvelope /></div><div className="stat-info"><span className="stat-value">{stats.totalContacts}</span><span className="stat-label">Contacts</span></div></div>
                                    <div className="stat-card"><div className="stat-icon"><FaProjectDiagram /></div><div className="stat-info"><span className="stat-value">{stats.totalProjects}</span><span className="stat-label">Projects</span></div></div>
                                    <div className="stat-card"><div className="stat-icon"><FaUsers /></div><div className="stat-info"><span className="stat-value">{stats.totalClients}</span><span className="stat-label">Clients</span></div></div>
                                    <div className="stat-card"><div className="stat-icon"><FaChartBar /></div><div className="stat-info"><span className="stat-value">{stats.monthlyVisits}</span><span className="stat-label">Visits</span></div></div>
                                </div>
                                <div className="dashboard-section">
                                    <h3>Recent Contacts</h3>
                                    <div className="data-table">
                                        {contacts.length === 0 ? (
                                            <p style={{ padding: '20px', color: '#666' }}>No contacts found.</p>
                                        ) : (
                                            <table>
                                                <thead><tr><th>Name</th><th>Email</th><th>Service</th><th>Date</th><th>Actions</th></tr></thead>
                                                <tbody>
                                                    {contacts.map((c) => (
                                                        <tr key={c.contactId}>
                                                            <td>{c.name}</td>
                                                            <td>{c.email}</td>
                                                            <td>{c.service || 'General Inquiry'}</td>
                                                            <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                                            <td>
                                                                <div className="action-btns">
                                                                    <button className="action-btn" title="View"><FaEye /></button>
                                                                    <button className="action-btn" onClick={() => handleDeleteContact(c.contactId)} title="Delete"><FaTrash style={{color: '#ef4444'}}/></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {activeTab === 'certificates' && (
                            <div className="dashboard-section">
                                <h3>Issue New Certificate</h3>
                                <div className="admin-login-card glass-card" style={{ maxWidth: '600px', margin: '20px 0', textAlign: 'left', padding: '30px' }}>
                                    <form onSubmit={handleAddCertificate} className="login-form">
                                        <div className="input-group">
                                            <label>Certificate ID (Unique)</label>
                                            <input type="text" value={certForm.certificateId} onChange={(e) => setCertForm({...certForm, certificateId: e.target.value.toUpperCase()})} placeholder="e.g. COT26XXA01" required />
                                        </div>
                                        <div className="input-group">
                                            <label>Recipient Name</label>
                                            <input type="text" value={certForm.name} onChange={(e) => setCertForm({...certForm, name: e.target.value})} placeholder="e.g. Kishore S" required />
                                        </div>
                                        <div className="input-group">
                                            <label>Course / Program</label>
                                            <input type="text" value={certForm.course} onChange={(e) => setCertForm({...certForm, course: e.target.value})} placeholder="e.g. React.js Bootcamp" required />
                                        </div>
                                        <div className="input-group">
                                            <label>Issue Date</label>
                                            <input type="date" value={certForm.issueDate} onChange={(e) => setCertForm({...certForm, issueDate: e.target.value})} required />
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={certStatus.type === 'loading'}>
                                            {certStatus.type === 'loading' ? 'Adding Certificate...' : 'Issue Certificate'}
                                        </button>
                                        
                                        {certStatus.message && (
                                            <div style={{ 
                                                marginTop: '20px', 
                                                padding: '10px', 
                                                borderRadius: '8px', 
                                                textAlign: 'center',
                                                backgroundColor: certStatus.type === 'success' ? '#dcfce7' : '#fee2e2',
                                                color: certStatus.type === 'success' ? '#16a34a' : '#ef4444',
                                                border: `1px solid ${certStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                                            }}>
                                                <strong>{certStatus.message}</strong>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab !== 'dashboard' && activeTab !== 'certificates' && (
                            <div className="dashboard-section">
                                <h3>{tabs.find(t => t.id === activeTab)?.label}</h3>
                                <p>Feature coming soon with backend integration.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Admin
