const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const fetchFromTMDB = async (endpoint, params = {}) => {
    if (!API_KEY) {
        console.warn('TMDB API Key is missing');
        return null;
    }

    const queryParams = new URLSearchParams({
        api_key: API_KEY,
        language: 'en-US',
        include_adult: false,
        ...params,
    });

    try {
        const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('TMDB API Error:', error);
        return null;
    }
};

export const tmdb = {
    getTrending: async (type = 'all', timeWindow = 'week', page = 1) => {
        return fetchFromTMDB(`/trending/${type}/${timeWindow}`, { page });
    },

    getMovies: async (category, page = 1) => {
        // Map our category names to TMDB genre IDs if needed, or use discover
        // For simplicity, we'll use 'popular', 'top_rated', or discover by genre
        if (category === 'Trending Now' || !category) return tmdb.getTrending('movie', 'week', page);
        if (category === 'New Releases') return fetchFromTMDB('/movie/now_playing', { page });
        if (category === 'Top Rated') return fetchFromTMDB('/movie/top_rated', { page });

        // Basic genre mapping (could be expanded)
        const genres = {
            'Action': 28,
            'Comedy': 35,
            'Drama': 18,
            'Sci-Fi': 878,
            'Horror': 27,
            'Documentary': 99,
            'Animation': 16,
        };
        const genreId = genres[category];
        if (genreId) {
            return fetchFromTMDB('/discover/movie', { with_genres: genreId, page });
        }
        return fetchFromTMDB('/movie/popular', { page });
    },

    getSeries: async (category, page = 1) => {
        if (category === 'Trending Series' || !category) return tmdb.getTrending('tv', 'week', page);
        if (category === 'New Releases') return fetchFromTMDB('/tv/on_the_air', { page });

        const genres = {
            'Action': 10759, // Action & Adventure
            'Comedy': 35,
            'Drama': 18,
            'Sci-Fi': 10765, // Sci-Fi & Fantasy
            'Documentary': 99,
            'Animation': 16,
        };
        const genreId = genres[category];
        if (genreId) {
            return fetchFromTMDB('/discover/tv', { with_genres: genreId, page });
        }
        return fetchFromTMDB('/tv/popular', { page });
    },

    search: async (query, page = 1) => {
        return fetchFromTMDB('/search/multi', { query, page });
    },

    getDetails: async (type, id) => {
        return fetchFromTMDB(`/${type}/${id}`, { append_to_response: 'credits,videos,similar' });
    }
};

// Helper to map Genre IDs to names
const getGenreName = (ids, type) => {
    if (!ids || ids.length === 0) return 'Unknown';

    const genreMap = {
        28: 'Action',
        12: 'Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        99: 'Documentary',
        18: 'Drama',
        10751: 'Family',
        14: 'Fantasy',
        36: 'History',
        27: 'Horror',
        10402: 'Music',
        9648: 'Mystery',
        10749: 'Romance',
        878: 'Sci-Fi',
        10770: 'TV Movie',
        53: 'Thriller',
        10752: 'War',
        37: 'Western',
        10759: 'Action', // TV Action & Adventure
        10762: 'Kids',
        10763: 'News',
        10764: 'Reality',
        10765: 'Sci-Fi', // TV Sci-Fi & Fantasy
        10766: 'Soap',
        10767: 'Talk',
        10768: 'War', // TV War & Politics
    };

    // Return the first matching genre that we have a category for
    for (const id of ids) {
        if (genreMap[id]) return genreMap[id];
    }
    return 'Unknown';
};

// Helper to transform TMDB data to our app's format
export const transformMedia = (item) => {
    if (!item) return null;

    // Determine type: prioritize media_type (from search/multi), then title vs name
    let type = 'movie'; // default
    if (item.media_type === 'tv' || item.media_type === 'movie') {
        type = item.media_type;
    } else if (item.name || item.first_air_date) {
        type = 'tv';
    }

    const isMovie = type === 'movie';

    return {
        id: item.id.toString(),
        tmdbId: item.id,
        title: item.title || item.name,
        description: item.overview,
        thumbnailUrl: item.backdrop_path
            ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
            : (item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : 'https://via.placeholder.com/780x440?text=No+Image'),
        posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        duration: isMovie ? 'Movie' : 'Series',
        releaseYear: (item.release_date || item.first_air_date || '').split('-')[0],
        type: isMovie ? 'movie' : 'tv', // Standardized to 'movie' | 'tv'
        // Map genres! Get from detailed response (genres) or list response (genre_ids)
        category: item.genres && item.genres.length > 0 
            ? item.genres[0].name 
            : getGenreName(item.genre_ids, type),
        rating: item.vote_average ? item.vote_average.toFixed(1) : 'N/A',
        originalLanguage: item.original_language,
        popularity: item.popularity,
        // New fields for UX
        seasons: item.seasons || [],
        similar: item.similar && item.similar.results
            ? item.similar.results.map(i => ({ ...transformMedia(i), type: i.media_type || type })) // Ensure type is preserved or inherited
            : []
    };
};

