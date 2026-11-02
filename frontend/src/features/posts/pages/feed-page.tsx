import { ArrowUpRight, Feather, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Avatar } from '../../../components/ui/avatar';
import { useSession } from '../../auth/hooks';
import { PostList } from '../components/post-list';

export function FeedPage() {
  const { data: user } = useSession();
  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="eyebrow">
            <span className="live-dot" />A SPACE FOR YOUR PERSPECTIVE
          </span>
          <h1>
            Good ideas deserve
            <br />a place to <span>belong.</span>
          </h1>
          <p>
            Big thoughts. Small discoveries. A little bit of you.
            <br className="desktop-break" /> Share what’s on your mind, and find a fresh
            perspective.
          </p>
          <Button asChild size="sm">
            <Link to="/posts/new">
              Make yourself heard
              <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>
        <div className="thread-art" aria-hidden="true">
          <div className="art-grid" />
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-paper paper-back">
            <span />
            <span />
            <span />
          </div>
          <div className="art-paper paper-front">
            <Feather size={28} strokeWidth={1.5} />
            <span />
            <span />
            <span />
            <div className="art-mini-lines">
              <i />
              <i />
              <i />
            </div>
          </div>
          <span className="art-spark">
            <Sparkles size={23} strokeWidth={1.5} />
          </span>
          <span className="art-dot" />
        </div>
      </section>
      <Link to="/posts/new" className="composer">
        <Avatar username={user?.username ?? 'your_perspective'} />
        <span>{user ? `What’s on your mind, ${user.username}?` : 'A thought worth sharing?'}</span>
        <span className="composer-action">
          <Plus size={17} />
          <span>Create a post</span>
        </span>
      </Link>
      <div className="feed-heading">
        <div>
          <span className="section-kicker">THE FEED</span>
          <h2>
            A fresh perspective<span>.</span>
          </h2>
        </div>
        <span className="sort-label">
          <span className="live-dot" />
          Newest first
        </span>
      </div>
      <PostList />
    </>
  );
}
