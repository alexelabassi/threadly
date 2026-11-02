import { formatDistanceToNowStrict } from 'date-fns';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../../components/ui/avatar';
import { readingTime } from '../../../lib/utils';
import type { Post } from '../types';

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      <div className="post-meta">
        <Link to={`/u/${post.author.username}`} className="author-link">
          <Avatar username={post.author.username} />
          <span>{post.author.username}</span>
        </Link>
        <span className="meta-dot">·</span>
        <time dateTime={post.createdAt} title={new Date(post.createdAt).toLocaleString()}>
          {formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}
        </time>
      </div>
      <Link to={`/posts/${post.id}`} className="post-content-link">
        <h2>{post.title}</h2>
        <p className="post-excerpt">{post.content}</p>
      </Link>
      <div className="post-footer">
        <span>
          <Clock3 size={13} />
          {readingTime(post.content)} min read
          {post.updatedAt && <span className="edited-tag"> · Edited</span>}
        </span>
        <Link to={`/posts/${post.id}`} className="read-post">
          Read post
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}
