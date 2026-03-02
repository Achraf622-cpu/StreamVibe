import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { Button } from '../components/common/Button';
import { VideoCard } from '../components/video/VideoCard';
import { Plus, Check, Star, Calendar, Clock, ArrowLeft, Play, X, Film } from 'lucide-react';

export default function VideoDetails() {
    const { id, type } = useParams(); // Get type from URL
    const navigate = useNavigate();
    const { allVideos, addToWatchlist, removeFromWatchlist, isInWatchlist, addToHistory, getMediaDetails } = useData();
    const [video, setVideo] = useState(null);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);
    const [server, setServer] = useState('vidsrc.xyz'); // Default to VidSrc (Faster)

    // TV Show State
    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (showTrailer) setShowTrailer(false);
                else navigate(-1);
            }
            if (e.key === 'f' || e.key === 'F') {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => console.log(err));
                } else {
                    document.exitFullscreen();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, showTrailer]);

    useEffect(() => {
        const loadVideo = async () => {
            setLoading(true);
            try {
                // first check if it's already in our loaded context data
                let found = allVideos.find(v => v.id === id);
                let mediaType = type === 'tv' || type === 'series' ? 'tv' : 'movie';

                if (found) {
                    setVideo(found);
                    if (found.type) mediaType = found.type; // Trust internal type if found
                }

                // If not found, OR if it's a TV show but missing seasons data (because list view doesn't have it)
                // We must fetch full details.
                const needsFetch = !found || (mediaType === 'tv' && (!found.seasons || found.seasons.length === 0)) || !found.similar;

                if (needsFetch) {
                    // Fetch full details
                    const detailed = await getMediaDetails(id, mediaType);
                    if (detailed) {
                        setVideo(detailed);
                        found = detailed; // Update reference for history/watchlist logic below
                    }
                }

                if (found) {
                    // setVideo(found); // Already set above or updated

                    // Safely check watchlist status
                    try {
                        setInWatchlist(isInWatchlist(found.id));
                    } catch (e) {
                        console.warn("Watchlist check failed", e);
                    }

                    // Safely add to history
                    try {
                        addToHistory(found);
                    } catch (e) {
                        console.error("Failed to add to history", e);
                    }
                }
            } catch (error) {
                console.error("Failed to load video details:", error);
            } finally {
                setLoading(false);
            }
        };

        loadVideo();
    }, [id, type, allVideos, isInWatchlist, addToHistory, getMediaDetails]);

    const handleWatchlistToggle = () => {
        if (inWatchlist) {
            removeFromWatchlist(video.id);
            setInWatchlist(false);
        } else {
            addToWatchlist(video);
            setInWatchlist(true);
        }
    };

    if (loading) return (
        <div className="container flex items-center justify-center h-screen" style={{ color: 'white' }}>
            <div className="spinner"></div> Loading...
        </div>
    );
    if (!video) return <div className="container pt-20 text-center">Video not found</div>;

    // Check type explicitly. transformMedia now returns 'tv' or 'movie'.
    const isSeries = video.type === 'tv' || video.type === 'SERIE';

    // VidKing Player Logic (Primary)
    const getEmbedUrl = () => {
        if (server === 'vidking') {
            return isSeries
                ? `https://www.vidking.net/embed/tv/${video.tmdbId}/${season}/${episode}?color=8b5cf6&autoPlay=0`
                : `https://www.vidking.net/embed/movie/${video.tmdbId}?color=8b5cf6&autoPlay=0`;
        }
        // Fallback
        return isSeries
            ? `https://vidsrc.xyz/embed/tv/${video.tmdbId}/${season}/${episode}`
            : `https://vidsrc.xyz/embed/movie/${video.tmdbId}`;
    };

    const embedUrl = getEmbedUrl();

    return (
        <div className="video-details-page" style={{ minHeight: '100vh', background: '#0f0f0f' }}>
            {/* Trailer Modal */}
            {showTrailer && video.trailerKey && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'rgba(0,0,0,0.9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        position: 'relative', width: '100%', maxWidth: '1000px',
                        aspectRatio: '16/9', background: 'black', borderRadius: '16px', overflow: 'hidden'
                    }}>
                        <button
                            onClick={() => setShowTrailer(false)}
                            style={{
                                position: 'absolute', top: '16px', right: '16px', zIndex: 101,
                                background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px',
                                color: 'white', border: 'none', cursor: 'pointer'
                            }}
                        >
                            <X size={24} />
                        </button>
                        <iframe
                            width="100%" height="100%"
                            src={`https://www.youtube.com/embed/${video.trailerKey}?autoplay=1`}
                            title="Trailer" frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
                <button
                    onClick={() => navigate('/', { replace: true })}
                    className="btn btn-ghost"
                    style={{ fontSize: '1rem', paddingLeft: 0 }}
                >
                    <ArrowLeft size={20} style={{ marginRight: '8px' }} /> Back to Home
                </button>
            </div>

            {/* Video Player Section */}
            <div className="container" style={{ marginBottom: '32px' }}>
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '80vh',
                    maxHeight: '800px',
                    backgroundColor: 'black',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <iframe
                        key={embedUrl}
                        width="100%"
                        height="100%"
                        src={embedUrl}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: '100%', height: '100%', border: 'none' }}
                    ></iframe>
                </div>

                {/* Server Selector */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Server:</span>
                    {['vidking', 'vidsrc.xyz', 'vidsrc.to'].map((srv) => (
                        <button
                            key={srv}
                            onClick={() => setServer(srv)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: server === srv ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                background: server === srv ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                color: server === srv ? 'var(--primary)' : 'var(--text-secondary)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize'
                            }}
                        >
                            {srv === 'vidking' ? 'VidKing (Premium)' : srv}
                        </button>
                    ))}
                </div>
            </div>

            {/* Series Controls - Smart Dropdowns */}
            {isSeries && (
                <div className="container" style={{ marginBottom: '32px' }}>
                    <div className="glass" style={{
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '24px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Play size={14} fill="white" />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Now Playing</span>
                        </div>

                        <div style={{ height: '32px', width: '1px', background: 'rgba(255, 255, 255, 0.1)', display: 'none', '@media (min-width: 768px)': { display: 'block' } }}></div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            {/* Season Selector */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                                    Season
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={season}
                                        onChange={(e) => {
                                            setSeason(Number(e.target.value));
                                            setEpisode(1); // Reset episode when season changes
                                        }}
                                        style={{
                                            appearance: 'none',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            padding: '10px 40px 10px 16px',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            outline: 'none',
                                            cursor: 'pointer',
                                            minWidth: '140px'
                                        }}
                                    >
                                        {video.seasons && video.seasons.length > 0 ? (
                                            video.seasons
                                                .filter(s => s.season_number > 0) // Filter out "Specials" (Season 0) usually
                                                .map(s => (
                                                    <option key={s.id} value={s.season_number} style={{ backgroundColor: '#222', color: 'white' }}>
                                                        Season {s.season_number}
                                                    </option>
                                                ))
                                        ) : (
                                            <option value="1" style={{ backgroundColor: '#222', color: 'white' }}>Season 1</option>
                                        )}
                                    </select>
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: 300, display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>/</span>

                            {/* Episode Selector */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                                    Episode
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={episode}
                                        onChange={(e) => setEpisode(Number(e.target.value))}
                                        style={{
                                            appearance: 'none',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            padding: '10px 40px 10px 16px',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            outline: 'none',
                                            cursor: 'pointer',
                                            minWidth: '140px'
                                        }}
                                    >
                                        {(() => {
                                            const currentSeasonData = video.seasons?.find(s => s.season_number === season);
                                            const episodeCount = currentSeasonData ? currentSeasonData.episode_count : 24; // Default if unknown

                                            return Array.from({ length: episodeCount }, (_, i) => i + 1).map(ep => (
                                                <option key={ep} value={ep} style={{ backgroundColor: '#222', color: 'white' }}>
                                                    Episode {ep}
                                                </option>
                                            ));
                                        })()}
                                    </select>
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                                        ▼
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container" style={{ paddingBottom: '80px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    {/* Main Info */}
                    <div style={{ flex: 1 }}>
                        <h1 style={{
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            background: 'linear-gradient(to right, #fff, #9ca3af)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>{video.title}</h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.125rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 500 }}>
                                <Star size={20} fill="currentColor" /> {video.rating}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={20} /> {video.releaseYear}
                            </span>
                            <span style={{ padding: '4px 12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                {video.duration}
                            </span>
                            <span style={{ padding: '4px 12px', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--primary)', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                {video.category}
                            </span>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px', color: 'white' }}>Synopsis</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.125rem' }}>
                                {video.description}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div style={{ flexShrink: 0 }}>
                        <div style={{ padding: '24px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', maxWidth: '320px' }}>
                            {video.trailerKey && (
                                <Button
                                    variant="secondary"
                                    icon={Film}
                                    onClick={() => setShowTrailer(true)}
                                    style={{ width: '100%', justifyContent: 'center', marginBottom: '16px', background: '#dc2626', color: 'white', border: '1px solid #dc2626' }}
                                >
                                    Watch Trailer
                                </Button>
                            )}
                            <Button
                                variant={inWatchlist ? 'primary' : 'outline'}
                                icon={inWatchlist ? Check : Plus}
                                onClick={handleWatchlistToggle}
                                style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}
                            >
                                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                            </Button>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                Syncs automatically to your account
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Content */}
            {video.similar && video.similar.length > 0 && (
                <div style={{ paddingBottom: '80px' }}>
                    <div className="container">
                        <h3 className="section-title" style={{ marginBottom: '20px' }}>You Might Also Like</h3>
                    </div>
                    <div className="rows-container">
                        <div className="container grid-view">
                            {video.similar.slice(0, 8).map(v => (
                                <VideoCard key={v.id} video={v} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
