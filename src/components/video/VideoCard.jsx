import { Link } from 'react-router-dom';
import { Play, Clock, Star } from 'lucide-react';

// Inline styles for fast prototyping, or using utility classes
// We will rely on our global styles mostly.

export const VideoCard = ({ video }) => {
    return (
        <Link to={`/watch/${video.type}/${video.id}`} className="video-card">
            <div className="video-thumbnail-wrapper">
                <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="video-thumbnail"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/780x440?text=No+Image'; }}
                />
                <div className="video-overlay">
                    <div className="play-button">
                        <Play size={24} fill="white" />
                    </div>
                </div>
                <div className="video-badge">{video.duration}</div>
            </div>

            <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <div className="video-meta">
                    <span className="video-category">{video.category}</span>
                    <span className="video-rating">
                        <Star size={12} fill="var(--warning)" color="var(--warning)" />
                        {video.rating}
                    </span>
                </div>
            </div>
        </Link>
    );
};
