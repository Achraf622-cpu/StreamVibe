import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { videos as mockVideos, categories as mockCategories } from '../data/mockData';
import { tmdb, transformMedia } from '../services/tmdb';
import { db, isFirebaseConfigured } from '../services/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    // Current User
    const { user } = useAuth();
    const isSyncingRef = useRef(false); // Prevent infinite loops during sync

    // Media State
    const [allVideos, setAllVideos] = useState([]); // Start empty or with mocks
    const [allCategories, setAllCategories] = useState(mockCategories);
    const [isLoading, setIsLoading] = useState(true);

    // User State - Local Storage default
    const [localWatchlist, setLocalWatchlist] = useLocalStorage('watchlist', []);
    const [localWatchHistory, setLocalWatchHistory] = useLocalStorage('watchHistory', []); // { videoId, timestamp, progress }

    // Live State
    const [watchlist, setWatchlistState] = useState(localWatchlist);
    const [watchHistory, setWatchHistoryState] = useState(localWatchHistory);

    const apiKey = import.meta.env.VITE_TMDB_API_KEY;

    // Advanced Sync Logic
    const setWatchlist = useCallback(async (newValOrUpdater) => {
        setWatchlistState(prev => {
            const resolved = typeof newValOrUpdater === 'function' ? newValOrUpdater(prev) : newValOrUpdater;
            if (!isFirebaseConfigured || !user) {
                setLocalWatchlist(resolved);
            } else if (!isSyncingRef.current) {
                // Upload to Firestore
                setDoc(doc(db, 'users', user.id), { watchlist: resolved }, { merge: true }).catch(e => console.error("Firestore sync error:", e));
            }
            return resolved;
        });
    }, [user, setLocalWatchlist]);

    const setWatchHistory = useCallback(async (newValOrUpdater) => {
        setWatchHistoryState(prev => {
            const resolved = typeof newValOrUpdater === 'function' ? newValOrUpdater(prev) : newValOrUpdater;
            if (!isFirebaseConfigured || !user) {
                setLocalWatchHistory(resolved);
            } else if (!isSyncingRef.current) {
                // Upload to Firestore
                setDoc(doc(db, 'users', user.id), { watchHistory: resolved }, { merge: true }).catch(e => console.error("Firestore sync error:", e));
            }
            return resolved;
        });
    }, [user, setLocalWatchHistory]);

    // Listen to Firestore if authenticated
    useEffect(() => {
        if (!isFirebaseConfigured || !user) {
            // Revert back to local if logged out
            if (!user) {
                setWatchlistState(localWatchlist);
                setWatchHistoryState(localWatchHistory);
            }
            return;
        }

        const userDocRef = doc(db, 'users', user.id);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            isSyncingRef.current = true;
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.watchlist) setWatchlistState(data.watchlist);
                if (data.watchHistory) setWatchHistoryState(data.watchHistory);
            } else {
                // Initialize document with local data if empty
                setDoc(userDocRef, { watchlist: localWatchlist, watchHistory: localWatchHistory });
            }
            // Add slight delay to let state settle before allowing local writes to push back
            setTimeout(() => { isSyncingRef.current = false; }, 100);
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch Data on Mount
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // If API Key is configured and not the placeholder
                if (apiKey && apiKey !== 'your_api_key_here') {
                    console.log("Fetching from TMDB API...");
                    // Fetch Trending Movies & Series mixed for "Home"
                    const data = await tmdb.getTrending('all', 'week');
                    if (data && data.results) {
                        const formatted = data.results.map(transformMedia);
                        setAllVideos(formatted);
                    } else {
                        console.warn("TMDB API returned no data");
                        setAllVideos(mockVideos);
                    }
                } else {
                    console.log("No valid API Key found, using Mock Data.");
                    setAllVideos(mockVideos);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
                setAllVideos(mockVideos);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [apiKey]); // Reload if key changes

    // Sanitize State Effect - Run once on mount to clear bad data
    useEffect(() => {
        let dirty = false;

        // Check watchlist
        if (Array.isArray(watchlist)) {
            const validWatchlist = watchlist.filter(v => v && v.id);
            if (validWatchlist.length !== watchlist.length) {
                setWatchlist(validWatchlist);
                dirty = true;
            }
        }

        // Check history
        if (Array.isArray(watchHistory)) {
            // Ensure distinct by ID to prevent duplicates causing key errors
            const uniqueIds = new Set();
            const validHistory = watchHistory.filter(v => {
                if (v && v.id && !uniqueIds.has(v.id)) {
                    uniqueIds.add(v.id);
                    return true;
                }
                return false;
            });

            if (validHistory.length !== watchHistory.length) {
                setWatchHistory(validHistory);
                dirty = true;
            }
        }

        if (dirty) console.log("Sanitized corrupted local storage data");
    }, []); // Run once on mount

    // Infinite Scroll / Pagination
    const loadMoreVideos = useCallback(async (page, type = 'all') => {
        if (!apiKey || apiKey === 'your_api_key_here') return; // No pagination for mock data

        setIsLoading(true);
        try {
            let data;
            // Map our internal types to API calls
            if (type === 'Movies' || type === 'FILM' || type === 'movie') data = await tmdb.getMovies('popular', page);
            else if (type === 'Series' || type === 'SERIE' || type === 'tv') data = await tmdb.getSeries('popular', page);
            else data = await tmdb.getTrending('all', 'week', page);

            if (data && data.results) {
                const formatted = data.results.map(transformMedia);
                // Appeand unique items only
                setAllVideos(prev => {
                    const existingIds = new Set(prev.map(v => v.id));
                    const newUnique = formatted.filter(v => !existingIds.has(v.id));
                    return [...prev, ...newUnique];
                });
            }
        } catch (error) {
            console.error("Error loading more videos:", error);
        } finally {
            setIsLoading(false);
        }
    }, [apiKey]);


    // Video Actions
    const addToWatchlist = useCallback((video) => {
        setWatchlist(prev => {
            if (!prev.find(v => v.id === video.id)) {
                return [...prev, video];
            }
            return prev;
        });
    }, [setWatchlist]);

    const removeFromWatchlist = useCallback((videoId) => {
        setWatchlist(prev => prev.filter(v => v.id !== videoId));
    }, [setWatchlist]);

    const isInWatchlist = useCallback((videoId) => {
        return watchlist.some(v => v.id === videoId);
    }, [watchlist]);

    const updateHistory = useCallback((videoId, percentage) => {
        setWatchHistory(prev => {
            const existing = prev.find(item => item.videoId === videoId);
            if (existing) {
                return prev.map(item =>
                    item.videoId === videoId ? { ...item, progress: percentage, timestamp: Date.now() } : item
                );
            }
            return [...prev, { videoId, progress: percentage, timestamp: Date.now() }];
        });
    }, [setWatchHistory]);

    const addToHistory = useCallback((video) => {
        // Simple wrapper to ensure item is in history list (logic similar to updateHistory but for initial view)
        setWatchHistory(prev => {
            const existing = prev.find(item => item.id === video.id);
            // Simplest fix: Just add it if not present, or bump timestamp
            const newEntry = { ...video, viewedAt: Date.now() };
            if (existing) {
                return prev.map(p => p.id === video.id ? { ...p, viewedAt: Date.now() } : p);
            }
            return [newEntry, ...prev].slice(0, 50); // Keep last 50
        });
    }, [setWatchHistory]);


    // Search Functionality (Hybrid: API + Local)
    const searchMedia = useCallback(async (query, page = 1) => {
        setIsLoading(true);
        let results = [];
        let total_pages = 1;

        if (apiKey && apiKey !== 'your_api_key_here') {
            try {
                const data = await tmdb.search(query, page);
                if (data && data.results && data.results.length > 0) {
                    results = data.results.map(transformMedia);
                    total_pages = data.total_pages;
                }
            } catch (error) {
                console.error("API Search error, falling back to local:", error);
            }
        }

        setIsLoading(false);
        return { results, total_pages };
    }, [apiKey]);

    // Get Details
    const getMediaDetails = useCallback(async (id, type = 'movie') => {
        try {
            // Try standard fetch
            const data = await tmdb.getDetails(type, id);
            if (data) return transformMedia(data);
            return null;
        } catch (e) {
            console.error("Failed to load details", e);
            return null;
        }
    }, []);

    // Auto-heal watchHistory "Unknown" categories on mount or when getMediaDetails is ready
    useEffect(() => {
        const healWatchHistory = async () => {
             if (!watchHistory || !Array.isArray(watchHistory)) return;
             
             const unknownItems = watchHistory.filter(v => v.category === 'Unknown' || v.type === undefined);
             if (unknownItems.length === 0) return;

             let modified = false;
             let newHistory = [...watchHistory];

             for (const item of unknownItems) {
                 try {
                     const details = await getMediaDetails(item.id, item.type || 'movie');
                     if (details && details.category && details.category !== 'Unknown') {
                         newHistory = newHistory.map(v => v.id === item.id ? { ...v, category: details.category, type: details.type || v.type } : v);
                         modified = true;
                     }
                 } catch (e) {
                     console.error("Auto-heal failed for", item.id);
                 }
             }

             if (modified) {
                 setWatchHistory(newHistory);
             }
        };

        healWatchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once to heal local storage

    return (
        <DataContext.Provider value={{
            allVideos,
            allCategories,
            watchlist,
            watchHistory,
            isLoading,
            addToWatchlist,
            removeFromWatchlist,
            isInWatchlist,
            updateHistory,
            addToHistory,
            loadMoreVideos,
            searchMedia,
            getMediaDetails
        }}>
            {children}
        </DataContext.Provider>
    );
};
