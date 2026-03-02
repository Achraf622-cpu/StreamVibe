import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { HeroSection } from '../components/video/HeroSection';
import { VideoCard } from '../components/video/VideoCard';
import { Button } from '../components/common/Button';
import { MovieRow } from '../components/video/MovieRow';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function Home() {
    const { allVideos, allCategories, loadMoreVideos, searchMedia, isLoading, watchHistory } = useData();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const searchQuery = searchParams.get('q') || '';

    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [apiSearchResults, setApiSearchResults] = useState([]);
    const [searchPage, setSearchPage] = useState(1);
    const [hasMoreSearch, setHasMoreSearch] = useState(true);

    // Determine filter mode based on URL
    const isMoviesPage = location.pathname === '/movies';
    const isSeriesPage = location.pathname === '/series';

    // Reset state when route or search changes
    useEffect(() => {
        setPage(1);
        setSearchPage(1);
        setApiSearchResults([]);
        setHasMoreSearch(true);
    }, [location.pathname, searchQuery]);

    // API Search Effect
    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery) {
                const data = await searchMedia(searchQuery, 1);
                setApiSearchResults(data.results || []);
                setHasMoreSearch((data.total_pages || 1) > 1);
            }
        };
        performSearch();
    }, [searchQuery]); // Run when query changes

    // Infinite Scroll Handler
    const handleLoadMore = useCallback(async () => {
        if (searchQuery) {
            // Load more search results
            if (!hasMoreSearch) return;
            const nextPage = searchPage + 1;
            const data = await searchMedia(searchQuery, nextPage);
            if (data && data.results && data.results.length > 0) {
                setApiSearchResults(prev => [...prev, ...data.results]);
                setSearchPage(nextPage);
                setHasMoreSearch(nextPage < (data.total_pages || 1));
            } else {
                setHasMoreSearch(false);
            }
        } else {
            // Load more trending/browsing content
            const nextPage = page + 1;
            setPage(nextPage);
            // Use standardized types
            const type = isMoviesPage ? 'movie' : (isSeriesPage ? 'tv' : 'all');
            loadMoreVideos(nextPage, type);
        }
    }, [page, searchPage, searchQuery, isMoviesPage, isSeriesPage, loadMoreVideos, searchMedia, hasMoreSearch]);

    const infiniteScrollRef = useInfiniteScroll(handleLoadMore, isLoading);


    // Filter videos based on page type (for Browsing Mode)
    const pageVideos = useMemo(() => {
        let vids = allVideos;
        // Standardized types from transformMedia are 'movie' and 'tv'
        if (isMoviesPage) return vids.filter(v => v.type === 'movie' || v.type === 'FILM');
        if (isSeriesPage) return vids.filter(v => v.type === 'tv' || v.type === 'SERIE');
        return vids;
    }, [allVideos, isMoviesPage, isSeriesPage]);

    // Featured video logic
    const featuredVideo = useMemo(() => {
        if (!allVideos || allVideos.length === 0) return null;

        let found = null;
        if (isSeriesPage) found = pageVideos.find(v => v.title === 'Stranger Things') || pageVideos[0];
        else if (isMoviesPage) found = pageVideos.find(v => v.title === 'Spider-Man: No Way Home') || pageVideos[0];
        else found = allVideos.find(v => v.title === 'Spider-Man: No Way Home') || allVideos.find(v => v.title === 'Inception') || allVideos[0];

        return found || pageVideos[0] || null;
    }, [pageVideos, isSeriesPage, isMoviesPage, allVideos]);


    return (
        <div className="home-page" style={{ paddingBottom: '100px' }}>
            {/* Show Hero only when NOT searching, or show a relevant result? Usually Hero is hidden on search */}
            {!searchQuery && <HeroSection video={featuredVideo} />}

            {/* Adjusted margin to -60px to overlap slightly but not cover buttons */}
            <div style={{ marginTop: searchQuery ? '40px' : '-60px', position: 'relative', zIndex: 10 }}>

                {/* Search Results Mode */}
                {searchQuery ? (
                    <div className="container" style={{ minHeight: '60vh' }}>
                        <div className="section-header">
                            <h2 className="section-title">Search Results for "{searchQuery}"</h2>
                        </div>
                        {apiSearchResults.length > 0 ? (
                            <div className="grid-view">
                                {apiSearchResults.map(video => (
                                    <VideoCard key={video.id} video={video} />
                                ))}
                            </div>
                        ) : (
                            !isLoading && <div className="text-center p-10 text-secondary">No results found</div>
                        )}

                        {/* Sentinel for Search Infinite Scroll */}
                        <div ref={infiniteScrollRef} className="loading-sentinel p-10 text-center">
                            {isLoading && <div className="spinner inline-block"></div>}
                        </div>
                    </div>
                ) : (
                    // Netflix-style Rows (Browsing Mode)
                    <div className="rows-container">
                        {/* 0. Continue Watching (if exists) */}
                        {watchHistory && watchHistory.length > 0 && (
                            <MovieRow title="Continue Watching" videos={watchHistory} />
                        )}

                        {/* 1. Trending / Main Row */}
                        <MovieRow title={isSeriesPage ? "Trending TV Shows" : (isMoviesPage ? "Trending Movies" : "Trending Now")} videos={pageVideos.slice(0, 8)} />

                        {/* 2. New Releases (Reverse Order) */}
                        <MovieRow title="New Releases" videos={[...pageVideos].reverse().slice(0, 8)} />

                        {/* 3. Category Rows */}
                        {allCategories.map(cat => {
                            // Find videos in this category AND match the page type
                            const catVideos = pageVideos.filter(v => v.category === cat.name);
                            if (catVideos.length === 0) return null;
                            return <MovieRow key={cat.id} title={cat.name} videos={catVideos} />;
                        })}

                        {/* Infinite Scroll Trigger - Discover More Grid */}
                        <div className="container mt-10">
                            <h3 className="section-title mb-4">Discover More</h3>
                            <div className="grid-view">
                                {pageVideos.slice(8).map(video => (
                                    <VideoCard key={video.id} video={video} />
                                ))}
                            </div>
                        </div>

                        {/* Sentinel for Browsing Infinite Scroll */}
                        <div ref={infiniteScrollRef} className="loading-sentinel p-10 text-center">
                            {isLoading && <div className="spinner inline-block"></div>}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
