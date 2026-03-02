import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { User, Mail, Calendar, Clock, CirclePlay } from 'lucide-react';
import '../styles/home.css'; // Reuse existing styles for section headers

export default function Profile() {
    const { user } = useAuth();
    const { watchHistory, watchlist } = useData();

    if (!user) return null;

    // Calculate simulated statistics
    const safeWatchHistory = Array.isArray(watchHistory) ? watchHistory : [];
    const safeWatchlist = Array.isArray(watchlist) ? watchlist : [];

    const totalWatchTime = safeWatchHistory.reduce((acc, current) => acc + (current.duration || 120), 0);
    const watchHours = Math.floor(totalWatchTime / 60);

    return (
        <div className="container" style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <div className="section-header">
                <h2 className="section-title">User Profile</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '20px' }}>
                {/* Account Details */}
                <div style={{ background: 'var(--surface)', padding: '30px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                        <img 
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`} 
                            alt="avatar" 
                            style={{ width: '80px', height: '80px', borderRadius: '50%' }}
                        />
                        <div>
                            <h3 style={{ fontSize: '1.5rem', margin: '0 0 5px 0' }}>{user.username}</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Member since 2026</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <User size={20} color="var(--primary)" />
                            <span>Username: {user.username}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Mail size={20} color="var(--primary)" />
                            <span>Email: {user.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Calendar size={20} color="var(--primary)" />
                            <span>Account ID: {user.id || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Viewing Statistics */}
                <div style={{ background: 'var(--surface)', padding: '30px', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: '0 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Viewing Statistics</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <CirclePlay size={32} color="var(--primary)" style={{ margin: '0 auto 10px auto' }} />
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>{safeWatchHistory.length}</h4>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Videos Watched</p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <Clock size={32} color="var(--primary)" style={{ margin: '0 auto 10px auto' }} />
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>~{watchHours}h</h4>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Total Watch Time</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>My List Items:</span>
                            <span style={{ fontWeight: 'bold' }}>{safeWatchlist.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
