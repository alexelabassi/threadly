import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Feather,
  FileText,
  Home,
  LogOut,
  Menu,
  Moon,
  PenLine,
  Plus,
  Sparkles,
  Sun,
  UserRound,
  X,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useLogout, useSession } from '../../features/auth/hooks';
import type { CurrentUser } from '../../features/auth/types';
import { useTheme } from '../../hooks/use-theme';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { FeedSkeleton } from '../common/states';

function SidebarNavigation({ user, close }: { user?: CurrentUser | null; close: () => void }) {
  const privateLink = (path: string) =>
    user ? path : `/login?returnTo=${encodeURIComponent(path)}`;
  const privateClass = ({ isActive }: { isActive: boolean }) => (user && isActive ? 'active' : '');
  return (
    <>
      <span className="nav-label">YOUR CORNER OF THE INTERNET</span>
      <nav className="side-nav" aria-label="Main navigation">
        <NavLink to="/" end onClick={close}>
          <Home size={18} />
          <span>Home feed</span>
          <span className="nav-active-dot" />
        </NavLink>
        <NavLink className={privateClass} to={privateLink('/my-posts')} onClick={close}>
          <FileText size={18} />
          <span>My posts</span>
        </NavLink>
        <NavLink className={privateClass} to={privateLink('/posts/new')} onClick={close}>
          <PenLine size={18} />
          <span>Create post</span>
          <Plus size={14} className="nav-plus" />
        </NavLink>
        <NavLink
          className={privateClass}
          to={privateLink(user ? `/u/${user.username}` : '/profile')}
          onClick={close}
        >
          <UserRound size={18} />
          <span>My profile</span>
        </NavLink>
      </nav>
      <div className="sidebar-note">
        <span className="note-feather">
          <Feather size={21} strokeWidth={1.5} />
        </span>
        <h3>
          A little thought.
          <br />A new perspective.
        </h3>
        <p>You don’t have to have it all figured out to have something worth sharing.</p>
        <Link to="/posts/new" onClick={close}>
          Write something
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="sidebar-bottom">
        <span className="tiny-brand">
          <span className="live-dot" />A little more human.
        </span>
        <p>Thoughtfully made. Open to everyone.</p>
        <span>© {new Date().getFullYear()} Threadly</span>
      </div>
    </>
  );
}

export function AppShell() {
  const session = useSession();
  const user = session.data;
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const authPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="header-brand-group">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </Button>
            <Link to="/" className="brand" aria-label="Threadly home">
              <span className="brand-icon">
                <BookOpen size={23} strokeWidth={2.3} />
              </span>
              <span>
                threadly<span className="brand-period">.</span>
              </span>
            </Link>
            <span className="brand-tagline">A little more human.</span>
          </div>
          <div className="header-actions">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
              onClick={toggle}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </Button>
            <span className="header-divider" />
            <Button asChild size="sm" className="header-create">
              <Link to="/posts/new">
                <Plus size={17} />
                Create post
              </Link>
            </Button>
            {session.isPending ? (
              <span className="skeleton header-user-skeleton" />
            ) : user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className="user-menu-trigger" aria-label="Open account menu">
                  <Avatar username={user.username} />
                  <ChevronDown size={14} />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="dropdown-content" align="end" sideOffset={12}>
                    <div className="dropdown-heading">
                      <strong>{user.username}</strong>
                      <span>{user.email}</span>
                    </div>
                    <DropdownMenu.Separator className="dropdown-separator" />
                    <DropdownMenu.Item asChild>
                      <Link to={`/u/${user.username}`}>
                        <UserRound size={16} />
                        My profile
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link to="/my-posts">
                        <FileText size={16} />
                        My posts
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="dropdown-separator" />
                    <DropdownMenu.Item
                      disabled={logout.isPending}
                      onSelect={() => logout.mutate(undefined, { onSuccess: () => navigate('/') })}
                    >
                      <LogOut size={16} />
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">
                  Log in
                  <ArrowRight size={14} />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className={cn('mobile-nav-panel', mobileOpen && 'is-open')}>
        <SidebarNavigation user={user} close={() => setMobileOpen(false)} />
      </div>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="mobile-scrim"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className={cn('workspace', authPage && 'workspace-auth')}>
        <aside className="left-sidebar">
          <SidebarNavigation user={user} close={() => setMobileOpen(false)} />
        </aside>
        <main id="main-content" className="main-content" key={location.pathname}>
          <Suspense fallback={<FeedSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
        {!authPage && (
          <aside className="right-sidebar">
            <section className="about-card">
              <div className="about-illustration" aria-hidden="true">
                <span className="about-orbit" />
                <span className="about-flower">
                  <Sparkles size={38} strokeWidth={1.2} />
                </span>
                <span className="about-small-dot" />
              </div>
              <span className="section-kicker">A LITTLE ABOUT US</span>
              <h2>
                More perspectives.
                <br />
                More possibility.
              </h2>
              <p>
                Threadly is a space for curious minds. Share an idea, tell a story, or discover a
                different way of seeing things.
              </p>
              <div className="about-points">
                <span>
                  <Check size={14} />
                  Real people. Original thoughts.
                </span>
                <span>
                  <Check size={14} />A space for every perspective.
                </span>
                <span>
                  <Check size={14} />
                  Less noise. More substance.
                </span>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to={user ? '/posts/new' : '/register'}>
                  {user ? 'Share your perspective' : 'Find your place here'}
                  <ArrowUpRight size={15} />
                </Link>
              </Button>
            </section>
            <section className="writing-note">
              <span className="section-kicker">
                <PenLine size={14} /> A NOTE TO THE WRITER
              </span>
              <h3>
                Your ordinary might be
                <br />
                someone else’s inspiration.
              </h3>
              <p>
                No perfect words needed.
                <br />
                Just your point of view.
              </p>
            </section>
            <footer className="right-footer">
              <span>Stay curious. Be kind. Keep sharing.</span>
              <span>
                Made for the way you think <span className="orange">✳</span>
              </span>
            </footer>
          </aside>
        )}
      </div>
    </div>
  );
}
