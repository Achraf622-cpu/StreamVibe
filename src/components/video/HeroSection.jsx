import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { Button } from '../common/Button';

export const HeroSection = ({ video }) => {
    if (!video) return null;

    if (!video) return null;

    return (
        <div className="hero-section" style={{ backgroundImage: `url(${video.thumbnailUrl})` }}>
            <div className="hero-overlay"></div>
            <div className="hero-content container" style={{ position: 'relative', zIndex: 5 }}>
                <div className="hero-badge">{video.type}</div>
                <h1 className="hero-title">{video.title}</h1>
                <p className="hero-description">{video.description}</p>

                <div className="flex gap-md">
                    <Link to={`/watch/${video.type}/${video.id}`}>
                        <Button variant="primary" size="lg" icon={Play}>
                            Play Now
                        </Button>
                    </Link>
                    <Link to={`/watch/${video.type}/${video.id}`}>
                        <Button variant="secondary" size="lg" icon={Info}>
                            More Info
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
