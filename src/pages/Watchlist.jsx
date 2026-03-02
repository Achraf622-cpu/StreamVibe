import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { VideoCard } from '../components/video/VideoCard';
import { Button } from '../components/common/Button';

export default function Watchlist() {
    const { watchlist } = useData();

    if (watchlist.length === 0) {
        return (
            <div className="container" style={{ paddingTop: '100px', textAlign: 'center', minHeight: '60vh' }}>
                <h1 style={{ marginBottom: '20px' }}>Your Watchlist is Empty</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
                    Start adding movies and shows to your list to keep track of what you want to watch.
                </p>
                <Link to="/">
                    <Button variant="primary" size="lg">Explore Content</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <div className="section-header">
                <h1 className="section-title">My List</h1>
            </div>

            <div className="grid gap-lg" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {watchlist.map(video => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
        </div>
    );
}
