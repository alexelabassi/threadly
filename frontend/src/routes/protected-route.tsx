import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorState, FeedSkeleton } from '../components/common/states';
import { useSession } from '../features/auth/hooks';

export function ProtectedRoute() {
  const { data: user, isPending, error, refetch } = useSession();
  const location = useLocation();
  if (isPending) return <FeedSkeleton />;
  if (error) return <ErrorState message={error.message} retry={() => void refetch()} />;
  if (!user)
    return (
      <Navigate
        replace
        to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
      />
    );
  return <Outlet />;
}
