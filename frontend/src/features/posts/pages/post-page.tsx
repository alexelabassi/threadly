import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ArrowLeft, ArrowUpRight, Clock3, Loader2, PenLine, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ApiError } from '../../../api/client';
import { ErrorState, FeedSkeleton, NotFound } from '../../../components/common/states';
import { Avatar } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { readingTime } from '../../../lib/utils';
import { useSession } from '../../auth/hooks';
import { postsApi } from '../api';
import { usePost } from '../hooks';

export function PostPage() {
  const { id } = useParams();
  const { data: post, isPending, error, refetch } = usePost(id);
  const { data: user } = useSession();
  const client = useQueryClient();
  const navigate = useNavigate();
  const deletion = useMutation({
    mutationFn: () => postsApi.delete(id!),
    onSuccess: async () => {
      client.removeQueries({ queryKey: ['posts', 'detail', id] });
      await client.invalidateQueries({ queryKey: ['posts', 'list'] });
      await client.invalidateQueries({ queryKey: ['user'] });
      toast.success('Your post has been deleted.');
      navigate('/');
    },
    onError: (e) => toast.error(e.message),
  });
  if (isPending) return <FeedSkeleton />;
  if (error)
    return error instanceof ApiError && error.status === 404 ? (
      <NotFound />
    ) : (
      <ErrorState message={error.message} retry={() => void refetch()} />
    );
  if (!post) return <NotFound />;
  return (
    <>
      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        Back to the feed
      </Link>
      <article className="post-detail">
        <div className="post-meta">
          <Link to={`/u/${post.author.username}`} className="author-link">
            <Avatar username={post.author.username} />
            <span>{post.author.username}</span>
          </Link>
          <span className="meta-dot">·</span>
          <time dateTime={post.createdAt}>
            {formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}
          </time>
        </div>
        <h1>{post.title}</h1>
        <div className="detail-submeta">
          <time dateTime={post.createdAt}>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</time>
          <span>·</span>
          <span>
            <Clock3 size={14} />
            {readingTime(post.content)} min read
          </span>
          {post.updatedAt && (
            <span title={new Date(post.updatedAt).toLocaleString()}>· Edited</span>
          )}
        </div>
        <div className="post-body">{post.content}</div>
        <div className="detail-footer">
          <Link to={`/u/${post.author.username}`} className="author-profile-link">
            <Avatar username={post.author.username} />
            <span>
              <small>A PERSPECTIVE BY</small>
              <strong>{post.author.username}</strong>
            </span>
            <ArrowUpRight size={17} />
          </Link>
          {user?.id === post.author.id && (
            <div className="owner-actions">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/posts/${post.id}/edit`}>
                  <PenLine size={14} />
                  Edit
                </Link>
              </Button>
              <AlertDialog.Root>
                <AlertDialog.Trigger asChild>
                  <Button variant="ghost" size="sm" className="delete-trigger">
                    <Trash2 size={15} />
                    Delete
                  </Button>
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Overlay className="dialog-overlay" />
                  <AlertDialog.Content className="dialog-content">
                    <span className="delete-dialog-icon">
                      <Trash2 size={23} />
                    </span>
                    <AlertDialog.Title>Delete this post?</AlertDialog.Title>
                    <AlertDialog.Description>
                      This will permanently delete “{post.title}”. You won’t be able to bring it
                      back.
                    </AlertDialog.Description>
                    <div className="dialog-actions">
                      <AlertDialog.Cancel asChild>
                        <Button variant="outline" disabled={deletion.isPending}>
                          Keep post
                        </Button>
                      </AlertDialog.Cancel>
                      <Button
                        variant="destructive"
                        disabled={deletion.isPending}
                        onClick={() => deletion.mutate()}
                      >
                        {deletion.isPending && <Loader2 size={15} className="spin" />}Delete post
                      </Button>
                    </div>
                  </AlertDialog.Content>
                </AlertDialog.Portal>
              </AlertDialog.Root>
            </div>
          )}
        </div>
      </article>
      <Link to="/" className="post-return">
        There’s more where that came from.
        <span>
          Explore the feed
          <ArrowUpRight size={15} />
        </span>
      </Link>
    </>
  );
}
