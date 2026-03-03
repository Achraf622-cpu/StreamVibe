import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function GlobalSearch() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { searchMedia } = useData();
    
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const debounceTimeout = useRef(null);

    // Sync query with URL if it changes externally
    useEffect(() => {
        if (!isOpen) {
            setQuery(searchParams.get('q') || '');
        }
    }, [searchParams, isOpen]);

    // Handle clicking outside to close the dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = async (searchTerm) => {
        if (!searchTerm.trim()) {
            setResults([]);
            setIsSearching(false);
            return;
        }
        
        setIsSearching(true);
        try {
            const data = await searchMedia(searchTerm, 1);
            // Limit to top 5 results for the dropdown
            setResults((data.results || []).slice(0, 5));
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(true);
        
        // Debounce the API call
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        
        if (value.trim()) {
            setIsSearching(true);
            debounceTimeout.current = setTimeout(() => {
                performSearch(value);
            }, 500); // 500ms delay
        } else {
            setResults([]);
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            setIsOpen(false);
            navigate(`/?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleResultClick = (video) => {
        setIsOpen(false);
        navigate(`/watch/${video.type}/${video.id}`);
        setQuery('');
    };

    const handleViewAll = () => {
        setIsOpen(false);
        navigate(`/?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', zIndex: 50 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--text-secondary)' }} />
                <input
                    type="text"
                    placeholder="Search movies, series..."
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => query.trim() && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius-full)',
                        padding: '10px 16px 10px 42px',
                        color: 'white',
                        outline: 'none',
                        width: '240px',
                        fontSize: '0.9rem',
                        transition: 'all var(--transition-normal)',
                        boxShadow: isOpen ? '0 0 0 2px rgba(168, 85, 247, 0.3)' : 'none',
                    }}
                    onMouseOver={(e) => { if(!isOpen) e.target.style.background = 'rgba(255, 255, 255, 0.12)'; }}
                    onMouseOut={(e) => { if(!isOpen) e.target.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                />
            </div>

            {/* Dropdown Results */}
            {isOpen && query.trim().length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    width: '320px',
                    background: 'rgba(15, 15, 20, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    {isSearching ? (
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '0.9rem' }}>Searching...</span>
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <div style={{ padding: '8px' }}>
                                {results.map(video => (
                                    <div 
                                        key={video.id}
                                        onClick={() => handleResultClick(video)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '8px',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ 
                                            width: '40px', 
                                            height: '60px', 
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            background: 'var(--bg-surface)' 
                                        }}>
                                            <img 
                                                src={video.posterUrl || video.thumbnailUrl} 
                                                alt={video.title} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/40x60?text=?'; }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ 
                                                fontSize: '0.95rem', 
                                                fontWeight: 600, 
                                                color: 'white',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                marginBottom: '4px'
                                            }}>{video.title}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                <span>{video.releaseYear}</span>
                                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }}></span>
                                                <span style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{video.type === 'tv' ? 'Series' : 'Movie'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div 
                                onClick={handleViewAll}
                                style={{ 
                                    padding: '12px', 
                                    textAlign: 'center', 
                                    background: 'rgba(255,255,255,0.03)', 
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    color: 'var(--primary)',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            >
                                View all {query ? `results for "${query}"` : 'results'}
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: '0.95rem' }}>No matches found for "{query}"</p>
                        </div>
                    )}
                </div>
            )}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
