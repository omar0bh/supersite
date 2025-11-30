import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { Loader, AlertCircle, Lock, User, TrendingUp, Users, FileText } from 'lucide-react';
import Button from '../ui/Button';

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Admin credentials
    const ADMIN_USERNAME = 'OMARADMIN';
    const ADMIN_PASSWORD = 'bouhanana2006sh';

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setAuthError('');
            fetchRequests();
        } else {
            setAuthError('Invalid username or password');
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching offers from:', API_ENDPOINTS.GET_OFFERS);
            const response = await fetch(API_ENDPOINTS.GET_OFFERS);
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch offers: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Received data:', result);
            
            if (result.success && Array.isArray(result.data)) {
                setRequests(result.data);
                console.log(`✓ Loaded ${result.data.length} offers`);
            } else {
                setRequests([]);
                console.warn('No offers data in response');
            }
        } catch (err) {
            console.error('Error fetching offers:', err);
            setError(`Failed to load offers. ${err.message}. Make sure the server is running on port 3003.`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (offerId) => {
        if (!window.confirm('Are you sure you want to delete this request?')) {
            return;
        }
        try {
            const response = await fetch(`${API_ENDPOINTS.DELETE_OFFER}/${offerId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setRequests(requests.filter(req => req.id !== offerId));
                console.log(`✓ Deleted offer ${offerId}`);
            } else {
                alert('Failed to delete request');
            }
        } catch (err) {
            console.error('Error deleting:', err);
            alert('Error deleting request');
        }
    };

    // Calculate statistics
    const totalRequests = requests.length;
    const todayRequests = requests.filter(req => {
        const reqDate = new Date(req.timestamp).toDateString();
        const today = new Date().toDateString();
        return reqDate === today;
    }).length;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--text-primary)] p-6">
                <div className="glass-panel p-8 rounded-3xl w-full max-w-md">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-[var(--glow-primary)]">
                            <Lock size={40} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-center mb-2">Admin Dashboard</h1>
                    <p className="text-center text-[var(--text-secondary)] mb-8">Enter your credentials to continue</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-[var(--text-secondary)]">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    className="w-full p-3 pl-12 rounded-xl input-field outline-none"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 text-[var(--text-secondary)]">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    className="w-full p-3 pl-12 rounded-xl input-field outline-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {authError && (
                            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl">
                                <AlertCircle size={16} /> {authError}
                            </div>
                        )}

                        <Button type="submit" variant="neon" className="w-full py-3">
                            Login to Dashboard
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center items-center bg-[var(--color-bg)] text-[var(--text-primary)]">
                <Loader className="animate-spin" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-12 bg-[var(--color-bg)] text-[var(--text-primary)]">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                        <p className="text-[var(--text-secondary)]">Welcome back, {ADMIN_USERNAME}</p>
                    </div>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-bold"
                    >
                        Logout
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <FileText className="text-blue-500" size={24} />
                            </div>
                            <TrendingUp className="text-green-500" size={20} />
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{totalRequests}</h3>
                        <p className="text-[var(--text-secondary)] text-sm">Total Requests</p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <Users className="text-green-500" size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{todayRequests}</h3>
                        <p className="text-[var(--text-secondary)] text-sm">Today's Requests</p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <TrendingUp className="text-purple-500" size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{requests.length > 0 ? requests[0].templateName : 'N/A'}</h3>
                        <p className="text-[var(--text-secondary)] text-sm">Latest Template</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-8 flex items-center gap-3">
                        <AlertCircle />
                        {error}
                    </div>
                )}

                {/* Requests Table */}
                <div className="glass-panel rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-[var(--border-color)] bg-[var(--surface-muted)]">
                        <h2 className="text-2xl font-bold">Customer Requests</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--surface-muted)] border-b border-[var(--border-color)]">
                                    <th className="p-6 font-bold text-[var(--text-secondary)]">Date</th>
                                    <th className="p-6 font-bold text-[var(--text-secondary)]">Client</th>
                                    <th className="p-6 font-bold text-[var(--text-secondary)]">Features</th>
                                    <th className="p-6 font-bold text-[var(--text-secondary)]">Price</th>
                                    <th className="p-6 font-bold text-[var(--text-secondary)]">Description</th>
                                    <th className="p-6 font-bold text-[var(--text-secondary)]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-[var(--text-secondary)]">
                                            No requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr key={req.id} className="border-b border-[var(--border-color)] hover:bg-[var(--surface-muted)] transition-colors">
                                            <td className="p-6 whitespace-nowrap text-sm">{req.timestamp}</td>
                                            <td className="p-6">
                                                <div className="font-bold">{req.name}</div>
                                                <div className="text-sm text-[var(--text-secondary)]">{req.phone}</div>
                                            </td>
                                            <td className="p-6 text-sm">
                                                {req.selectedFeatures && req.selectedFeatures.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {req.selectedFeatures.map((f, i) => (
                                                            <div key={i} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">
                                                                {f.name} (+{f.price} DH)
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-[var(--text-secondary)]">Base Package</span>
                                                )}
                                            </td>
                                            <td className="p-6 font-bold text-[var(--accent-secondary)] text-lg">
                                                {req.totalPrice || 2000} DH
                                            </td>
                                            <td className="p-6 text-sm max-w-md truncate" title={req.description}>
                                                {req.description || 'No description'}
                                            </td>
                                            <td className="p-6">
                                                <button
                                                    onClick={() => handleDelete(req.id)}
                                                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-bold border border-red-500/30"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
