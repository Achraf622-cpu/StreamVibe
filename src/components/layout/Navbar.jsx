import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, LogOut } from 'lucide-react';
import { Button } from '../common/Button';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Sync state with URL param
    useEffect(() => {
        setSearchTerm(searchParams.get('q') || '');
    }, [searchParams]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim()) {
            // Navigate to home with query param if searching
            navigate(`/?q=${encodeURIComponent(value)}`);
        } else {
            // Clear search if empty
            if (location.pathname === '/') {
                setSearchParams({});
            } else {
                // If on another page and clear search, maybe stay there or go home?
                // Logic: if I was searching, I probably want to see default home.
                // If I was on /watch/..., I probably want that page back?
                // But the input is usually Global.
                // Let's just clear params if on home, or do nothing if elsewhere (just empty input).
                if (searchParams.get('q')) {
                    navigate('/');
                }
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                {/* Search Bar */}
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--text-secondary)' }} />
                    <input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '8px 15px 8px 35px',
                            color: 'white',
                            outline: 'none',
                            width: '200px'
                        }}
                    />
                </div>

                <Button variant="ghost" size="sm">
                    <Bell size={20} />
                </Button>

                <div className="user-menu" onClick={handleLogout} title="Click to logout">
                    <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'User'}`}
                        alt="Profile"
                        className="user-avatar"
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.username}</span>
                    <LogOut size={16} style={{ marginLeft: '10px' }} />
                </div>
            </div>
        </nav>
    );
};
