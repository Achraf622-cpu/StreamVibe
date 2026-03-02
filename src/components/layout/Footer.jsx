import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-col">
                    <h4 className="nav-brand">STREAMVIBE</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
                        The best streaming experience for watching your favorite movies and shows on demand, anytime, anywhere.
                    </p>
                    <div className="flex gap-md" style={{ marginTop: '1rem' }}>
                        <Facebook size={20} color="var(--text-secondary)" />
                        <Twitter size={20} color="var(--text-secondary)" />
                        <Instagram size={20} color="var(--text-secondary)" />
                        <Youtube size={20} color="var(--text-secondary)" />
                    </div>
                </div>

                <div className="footer-col">
                    <h4>Links</h4>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/movies">Movies</Link></li>
                        <li><Link to="/series">Series</Link></li>
                        <li><Link to="/watchlist">My List</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Support</h4>
                    <ul className="footer-links">
                        <li><a href="#">FAQ</a></li>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Contact</h4>
                    <ul className="footer-links">
                        <li>Email: support@streamvibe.com</li>
                        <li>Phone: +1 (800) 123-4567</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} StreamVibe. All rights reserved.
            </div>
        </footer>
    );
};
