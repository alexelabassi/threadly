import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorState, FeedSkeleton } from '../../../components/common/states';
import { Button } from '../../../components/ui/button';
import { usePosts } from '../hooks';
import { PostCard } from './post-card';

export function PostList({ username, own }: { username?: string; own?: boolean }) {
  const [params, setParams] = useSearchParams();
  const page = Math.min(100000, Math.max(1, Math.floor(Number(params.get('page'))) || 1));
  const { data, isPending, error, refetch, isPlaceholderData } = usePosts(page, username);
  if (isPending) return <FeedSkeleton />;
  if (error) return <ErrorState message={error.message} retry={() => void refetch()} />;
  if (!data) return null;
  function go(next: number) {
    setParams(next > 1 ? { page: String(next) } : {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  return (
    <>
      <div className="feed-list" aria-busy={isPlaceholderData}>
        {data.items.length ? (
          data.items.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <EmptyState own={own} />
        )}
      </div>
      {data.totalPages > 1 && (
        <nav className="pagination" aria-label="Feed pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || isPlaceholderData}
            onClick={() => go(page - 1)}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <span>
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages || isPlaceholderData}
            onClick={() => go(page + 1)}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </nav>
      )}
      {!data.items.length && page > 1 && (
        <Button className="mt-5" variant="outline" onClick={() => go(1)}>
          Return to first page
        </Button>
      )}
      <p className="feed-end">
        <span />A little perspective goes a long way.
        <span />
      </p>
    </>
  );
}
