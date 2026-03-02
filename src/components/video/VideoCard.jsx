import { Link } from 'react-router-dom';
import { Play, Star, Plus, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const VideoCard = ({ video }) => {
    const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useData();
    const inWatchlist = isInWatchlist(video.id);

    const handleWatchlistClick = (e) => {
        e.preventDefault(); // Prevent navigating to the watch page
        if (inWatchlist) {
            removeFromWatchlist(video.id);
        } else {
            addToWatchlist(video);
        }
    };

    return (
        <Link to={`/watch/${video.type}/${video.id}`} className="video-card" style={{ position: 'relative' }}>
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
                <button 
                    onClick={handleWatchlistClick}
                    style={{ 
                        position: 'absolute', top: '10px', right: '10px', 
                        background: inWatchlist ? 'var(--primary)' : 'rgba(0,0,0,0.6)', 
                        border: 'none', borderRadius: '50%', width: '32px', height: '32px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                        zIndex: 2, transition: 'all 0.2s ease'
                    }}
                    title={inWatchlist ? "Remove from My List" : "Add to My List"}
                >
                    {inWatchlist ? <Check size={16} color="white" /> : <Plus size={16} color="white" />}
                </button>
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
