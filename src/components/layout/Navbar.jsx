import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, LogOut } from 'lucide-react';
import { Button } from '../common/Button';
import { GlobalSearch } from './GlobalSearch';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        e.stopPropagation();
        logout();
        navigate('/login');
    };

    const handleProfileNavigation = () => {
        navigate('/profile');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <Link to="/" className="nav-brand">
                <span style={{ color: 'var(--primary)' }}>STREAM</span>
                <span style={{ color: 'white' }}>VIBE</span>
            </Link>

            <div className="nav-links">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Home
                </NavLink>
                <NavLink to="/series" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Series
                </NavLink>
                <NavLink to="/movies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Movies
                </NavLink>
                <NavLink to="/watchlist" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    My List
                </NavLink>
            </div>

            <div className="nav-actions">
                {/* Search Bar - Global Search Component */}
                <GlobalSearch />

                <Button variant="ghost" size="sm">
                    <Bell size={20} />
                </Button>

                <div className="user-menu" onClick={handleProfileNavigation} title="View Profile" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'User'}`}
                        alt="Profile"
                        className="user-avatar"
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.username}</span>
                    <button 
                        onClick={handleLogout} 
                        style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </nav>
    );
};
