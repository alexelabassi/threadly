import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarDays, FileText, PenLine } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import { ErrorState, FeedSkeleton, NotFound } from '../../../components/common/states';
import { Avatar } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { useSession } from '../../auth/hooks';
import { PostList } from '../../posts/components/post-list';
import { getUser } from '../api';

export function ProfilePage({ mine = false }: { mine?: boolean }) {
  const params = useParams();
  const { data: session } = useSession();
  const username = mine ? session?.username : params.username;
  const query = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUser(username!),
    enabled: !!username,
    retry: false,
  });
  if (query.isPending) return <FeedSkeleton />;
  if (query.error)
    return query.error instanceof ApiError && query.error.status === 404 ? (
      <NotFound />
    ) : (
      <ErrorState message={query.error.message} retry={() => void query.refetch()} />
    );
  const user = query.data;
  if (!user) return <NotFound />;
  const own = user.id === session?.id;
  return (
    <>
      <section className="profile-card">
        <div className="profile-cover">
          <span />
          <span />
          <span />
        </div>
        <div className="profile-info">
          <Avatar username={user.username} large />
          <span className="section-kicker">
            {own ? 'YOUR LITTLE CORNER' : 'A THREADLY PERSPECTIVE'}
          </span>
          <h1>
            {user.username}
            <span>.</span>
          </h1>
          <div className="profile-meta">
            <span>
              <CalendarDays size={14} />
              Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
            </span>
            <span>
              <FileText size={14} />
              {user.postCount} {user.postCount === 1 ? 'post' : 'posts'}
            </span>
          </div>
          {own && (
            <Button asChild size="sm">
              <Link to="/posts/new">
                <PenLine size={15} />
                Write a post
              </Link>
            </Button>
          )}
        </div>
      </section>
      <div className="feed-heading profile-feed-heading">
        <div>
          <span className="section-kicker">{own ? 'IN YOUR OWN WORDS' : 'IN THEIR OWN WORDS'}</span>
          <h2>
            {mine ? 'My posts' : own ? 'Your perspectives' : 'Their perspectives'}
            <span>.</span>
          </h2>
        </div>
        <span className="sort-label">
          <span className="live-dot" />
          Newest first
        </span>
      </div>
      <PostList username={user.username} own={own} />
    </>
  );
}
