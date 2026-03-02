import { useRef } from 'react';
import { VideoCard } from '../video/VideoCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/home.css'; // Ensure styles are available

export const MovieRow = ({ title, videos }) => {
    const rowRef = useRef(null);

    const scroll = (direction) => {
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth / 2
                : scrollLeft + clientWidth / 2;

            rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (!videos || videos.length === 0) return null;

    return (
        <div className="movie-row-container">
            <h2 className="row-title">{title}</h2>

            <div className="row-wrapper">
                <button
                    className="row-arrow left"
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={32} />
                </button>

                <div className="movie-row" ref={rowRef}>
                    {videos.filter(v => v && v.id).map(video => (
                        <div key={video.id} className="row-item">
                            <VideoCard video={video} />
                        </div>
                    ))}
                </div>

                <button
                    className="row-arrow right"
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                >
                    <ChevronRight size={32} />
                </button>
            </div>
        </div>
    );
};
