import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            const result = register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                avatar: `https://ui-avatars.com/api/?name=${formData.username}&background=random`
            });

            if (result.success) {
                navigate('/');
            } else {
                setError(result.message);
                setLoading(false);
            }
        }, 500);
    };

    return (
        <div className="auth-container">
            <div className="glass-card auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join StreamVibe and start watching today</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <Input
                        label="Username"
                        type="text"
                        placeholder="johndoe"
                        icon={User}
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        icon={Mail}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                    />

                    <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} icon={ArrowRight}>
                        Create Account
                    </Button>
                </form>

                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login" className="auth-link">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
