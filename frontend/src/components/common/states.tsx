import { ArrowLeft, Feather, RefreshCw, Unplug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export function FeedSkeleton() {
  return (
    <div className="feed-list" aria-busy="true" aria-label="Loading posts">
      {[1, 2, 3].map((i) => (
        <div className="post-card skeleton-card" key={i}>
          <div className="skeleton skeleton-meta" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
export function EmptyState({ own = false }: { own?: boolean }) {
  return (
    <div className="state-card">
      <span className="state-icon">
        <Feather size={28} />
      </span>
      <h2>{own ? 'Your next idea starts here.' : 'A little quiet, for now.'}</h2>
      <p>
        {own
          ? 'Big ideas and small observations. This is your space to share them.'
          : 'There are no posts here yet. Be the first to share a perspective.'}
      </p>
      <Button asChild>
        <Link to="/posts/new">Write a post</Link>
      </Button>
    </div>
  );
}
export function ErrorState({ message, retry }: { message?: string; retry?: () => void }) {
  return (
    <div className="state-card" role="alert">
      <span className="state-icon">
        <Unplug size={28} />
      </span>
      <h2>We hit a little snag.</h2>
      <p>{message || 'We couldn’t load this page. Give it another try.'}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          <RefreshCw size={16} />
          Try again
        </Button>
      )}
    </div>
  );
}
export function NotFound() {
  return (
    <div className="state-card not-found">
      <span className="eyebrow">A WRONG TURN</span>
      <div className="big-404">
        404<span>.</span>
      </div>
      <h1>This thread ends here.</h1>
      <p>
        The page may have moved, or the post may have been deleted. There’s more to discover back
        home.
      </p>
      <Button asChild>
        <Link to="/">
          <ArrowLeft size={16} />
          Back to the feed
        </Link>
      </Button>
    </div>
  );
}
