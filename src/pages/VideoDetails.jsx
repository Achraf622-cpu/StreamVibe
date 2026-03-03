import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { Button } from '../components/common/Button';
import { VideoCard } from '../components/video/VideoCard';
import { Plus, Check, Star, Calendar, Clock, ArrowLeft, Play, X, Film } from 'lucide-react';

export default function VideoDetails() {
    const { id, type } = useParams(); // Get type from URL
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const { allVideos, addToWatchlist, removeFromWatchlist, isInWatchlist, addToHistory, getMediaDetails } = useData();
    const [video, setVideo] = useState(null);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);
    const [server, setServer] = useState('vidsrc.xyz'); // Default to VidSrc (Faster)

    // TV Show State - initialize from URL if available
    const initialSeason = parseInt(searchParams.get('season')) || 1;
    const initialEpisode = parseInt(searchParams.get('episode')) || 1;
    const [season, setSeason] = useState(initialSeason);
    const [episode, setEpisode] = useState(initialEpisode);

    // Sync TV Show state back to the URL so refreshes don't lose progress
    useEffect(() => {
        const isSeries = type === 'tv' || type === 'series' || video?.type === 'tv' || video?.type === 'SERIE';
        if (isSeries) {
            const params = new URLSearchParams(searchParams);
            let changed = false;
            
            if (season !== 1 || params.has('season')) { params.set('season', season); changed = true; }
            if (episode !== 1 || params.has('episode')) { params.set('episode', episode); changed = true; }
            
            // Cleanup defaults
            if (season === 1) { params.delete('season'); changed = true; }
            if (episode === 1) { params.delete('episode'); changed = true; }

            if (changed) {
                setSearchParams(params, { replace: true });
            }
        }
    }, [season, episode, type, video?.type, searchParams, setSearchParams]);

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
        <div className="video-details-page" style={{ 
            minHeight: '100vh', 
            backgroundColor: 'var(--bg-primary)',
            position: 'relative',
            overflowX: 'hidden'
        }}>
            {/* Immersive Cinematic Backdrop */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100vh',
                backgroundImage: `url(${video.backdropUrl || video.thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 20%',
                opacity: 0.3,
                filter: 'blur(20px)',
                zIndex: 0,
                maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
            }}></div>

            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100vh',
                background: 'linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,0.8) 50%, var(--bg-primary) 100%)',
                zIndex: 0
            }}></div>

            {/* Content Wrapper */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                {/* Trailer Modal */}
                {showTrailer && video.trailerKey && (
                    <div className="animate-fade-in" style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.95)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 'var(--spacing-xl)'
                    }}>
                        <div style={{
                            position: 'relative', width: '100%', maxWidth: '1200px',
                            aspectRatio: '16/9', background: 'black', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                            boxShadow: '0 0 50px rgba(168,85,247,0.2), 0 20px 40px rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <button
                                onClick={() => setShowTrailer(false)}
                                style={{
                                    position: 'absolute', top: '24px', right: '24px', zIndex: 101,
                                    background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '12px',
                                    color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                                    backdropFilter: 'blur(4px)', transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
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

                <div className="container animate-fade-in" style={{ paddingTop: '100px', paddingBottom: '32px' }}>
                    <button
                        onClick={() => navigate('/', { replace: true })}
                        className="btn btn-ghost"
                        style={{ fontSize: '1rem', paddingLeft: 0, opacity: 0.8 }}
                    >
                        <ArrowLeft size={20} style={{ marginRight: '8px' }} /> Back to Browse
                    </button>
                </div>

                {/* Floating Video Player Section */}
                <div className="container animate-fade-in animate-delay-1" style={{ marginBottom: '40px' }}>
                    <div className="glass-card" style={{
                        position: 'relative',
                        width: '100%',
                        height: '75vh',
                        maxHeight: '800px',
                        backgroundColor: '#000',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        padding: '4px', // Glass border effect
                    }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: 'calc(var(--radius-lg) - 4px)', overflow: 'hidden' }}>
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
                    </div>

                    {/* Server Selector */}
                    <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', padding: '0 8px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Server</span>
                        {['vidking', 'vidsrc.xyz', 'vidsrc.to'].map((srv) => (
                            <button
                                key={srv}
                                onClick={() => setServer(srv)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-full)',
                                    border: server === srv ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                                    background: server === srv ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.03)',
                                    color: server === srv ? '#fff' : 'var(--text-secondary)',
                                    fontSize: '0.8rem',
                                    fontWeight: server === srv ? 600 : 500,
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)',
                                    textTransform: 'capitalize',
                                    boxShadow: server === srv ? '0 0 15px rgba(168,85,247,0.2)' : 'none'
                                }}
                                onMouseOver={(e) => { if(server !== srv) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                onMouseOut={(e) => { if(server !== srv) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                            >
                                {srv === 'vidking' ? 'VidKing (Premium)' : srv}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Series Controls - Premium Dropdowns */}
                {isSeries && (
                    <div className="container animate-fade-in animate-delay-2" style={{ marginBottom: '40px' }}>
                        <div className="glass-card" style={{
                            padding: '24px 32px',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '32px',
                            background: 'rgba(15,15,20,0.6)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--primary) 0%, #d8b4fe 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 20px rgba(168,85,247,0.4)'
                                }}>
                                    <Play size={18} fill="white" color="white" style={{ marginLeft: '2px' }}/>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block' }}>Now Playing</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#fff' }}>Select Episode</span>
                                </div>
                            </div>

                            <div style={{ height: '40px', width: '1px', background: 'rgba(255, 255, 255, 0.1)', display: 'none', '@media (min-width: 768px)': { display: 'block' } }}></div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', flex: 1 }}>
                                {/* Season Selector */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '150px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={season}
                                            onChange={(e) => {
                                                setSeason(Number(e.target.value));
                                                setEpisode(1);
                                            }}
                                            style={{
                                                appearance: 'none',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '14px 40px 14px 20px',
                                                color: 'white',
                                                fontSize: '1.05rem',
                                                fontWeight: 600,
                                                outline: 'none',
                                                cursor: 'pointer',
                                                width: '100%',
                                                transition: 'all 0.2s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
                                            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                        >
                                            {video.seasons && video.seasons.length > 0 ? (
                                                video.seasons
                                                    .filter(s => s.season_number > 0)
                                                    .map(s => (
                                                        <option key={s.id} value={s.season_number} style={{ backgroundColor: 'var(--bg-surface)', color: 'white' }}>
                                                            Season {s.season_number}
                                                        </option>
                                                    ))
                                            ) : (
                                                <option value="1" style={{ backgroundColor: 'var(--bg-surface)', color: 'white' }}>Season 1</option>
                                            )}
                                        </select>
                                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--primary)' }}>
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                <span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.2)', fontWeight: 300, display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>/</span>

                                {/* Episode Selector */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '150px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={episode}
                                            onChange={(e) => setEpisode(Number(e.target.value))}
                                            style={{
                                                appearance: 'none',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '14px 40px 14px 20px',
                                                color: 'white',
                                                fontSize: '1.05rem',
                                                fontWeight: 600,
                                                outline: 'none',
                                                cursor: 'pointer',
                                                width: '100%',
                                                transition: 'all 0.2s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
                                            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                        >
                                            {(() => {
                                                const currentSeasonData = video.seasons?.find(s => s.season_number === season);
                                                const episodeCount = currentSeasonData ? currentSeasonData.episode_count : 24;

                                                return Array.from({ length: episodeCount }, (_, i) => i + 1).map(ep => (
                                                    <option key={ep} value={ep} style={{ backgroundColor: 'var(--bg-surface)', color: 'white' }}>
                                                        Episode {ep}
                                                    </option>
                                                ));
                                            })()}
                                        </select>
                                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--primary)' }}>
                                            ▼
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Metadata & Actions */}
                <div className="container animate-fade-in animate-delay-2" style={{ paddingBottom: '80px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px' }}>
                        {/* Main Info */}
                        <div style={{ flex: '1 1 600px' }}>
                            <h1 style={{
                                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                                fontWeight: '800',
                                marginBottom: '20px',
                                background: 'linear-gradient(to right, #ffffff, #a1a1aa)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.03em',
                                lineHeight: 1.1,
                                textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                            }}>{video.title}</h1>

                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 600, background: 'rgba(251, 191, 36, 0.1)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                                    <Star size={16} fill="currentColor" /> {video.rating}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Calendar size={16} /> {video.releaseYear}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-full)', padding: '6px 14px', fontWeight: 500, color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <Clock size={16}/> {video.duration}
                                </span>
                                <span style={{ padding: '6px 16px', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', fontWeight: 600, border: '1px solid rgba(168, 85, 247, 0.3)', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                                    {video.category}
                                </span>
                            </div>

                            <div style={{ marginBottom: '40px', maxWidth: '800px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '4px', height: '20px', background: 'var(--primary)', borderRadius: '4px', boxShadow: '0 0 10px var(--primary-glow)' }}></div>
                                    Storyline
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, fontSize: '1.15rem', fontWeight: 300, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                    {video.description}
                                </p>
                            </div>
                        </div>

                        {/* Sidebar Actions */}
                        <div style={{ flex: '0 1 340px', width: '100%' }}>
                            <div className="glass-card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%' }}>
                                {video.trailerKey && (
                                    <button
                                        onClick={() => setShowTrailer(true)}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                            padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px',
                                            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white',
                                            fontWeight: 700, fontSize: '1.05rem', border: 'none', cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            boxShadow: '0 10px 20px -10px rgba(239, 68, 68, 0.6)'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 25px -10px rgba(239, 68, 68, 0.8)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px -10px rgba(239, 68, 68, 0.6)'; }}
                                    >
                                        <Film size={20} /> Watch Trailer
                                    </button>
                                )}
                                <button
                                    onClick={handleWatchlistToggle}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                        padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px',
                                        background: inWatchlist ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.05)',
                                        color: inWatchlist ? 'var(--primary)' : 'white',
                                        fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer',
                                        border: inWatchlist ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = inWatchlist ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.1)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = inWatchlist ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.05)'; }}
                                >
                                    {inWatchlist ? <Check size={20} /> : <Plus size={20} />}
                                    {inWatchlist ? 'Added to Watchlist' : 'Add to Watchlist'}
                                </button>
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '20px 0' }}></div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Star size={14} /> Syncs automatically to your local storage
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Content */}
                {video.similar && video.similar.length > 0 && (
                    <div className="animate-fade-in animate-delay-3" style={{ paddingBottom: '80px', position: 'relative', zIndex: 10 }}>
                        <div className="container">
                            <h3 className="section-title" style={{ 
                                fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px', color: '#fff',
                                display: 'flex', alignItems: 'center', gap: '12px' 
                            }}>
                                <div style={{ width: '4px', height: '24px', background: 'var(--primary)', borderRadius: '4px', boxShadow: '0 0 10px var(--primary-glow)' }}></div>
                                You Might Also Like
                            </h3>
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
        </div>
    );
}
