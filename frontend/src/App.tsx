import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { lazy } from 'react';
import { NotFound } from './components/common/states';
import { AppShell } from './components/layout/app-shell';
import { FeedPage } from './features/posts/pages/feed-page';
import { ProtectedRoute } from './routes/protected-route';

const AuthPage = lazy(() =>
  import('./features/auth/pages/auth-page').then((m) => ({ default: m.AuthPage })),
);
const EditorPage = lazy(() =>
  import('./features/posts/pages/editor-page').then((m) => ({ default: m.EditorPage })),
);
const PostPage = lazy(() =>
  import('./features/posts/pages/post-page').then((m) => ({ default: m.PostPage })),
);
const ProfilePage = lazy(() =>
  import('./features/users/pages/profile-page').then((m) => ({ default: m.ProfilePage })),
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<FeedPage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="register" element={<AuthPage register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="posts/new" element={<EditorPage />} />
            <Route path="posts/:id/edit" element={<EditorPage />} />
            <Route path="my-posts" element={<ProfilePage mine />} />
            <Route path="profile" element={<ProfilePage mine />} />
          </Route>
          <Route path="posts/:id" element={<PostPage />} />
          <Route path="u/:username" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" richColors closeButton />
    </BrowserRouter>
  );
}
