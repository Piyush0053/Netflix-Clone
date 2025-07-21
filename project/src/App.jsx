import { Suspense } from 'react';
import { Route, createRoutesFromElements, RouterProvider, createBrowserRouter } from 'react-router-dom';
import NetflixHome from './pages/Home/NetflixHome';
import NetflixShow from './pages/NetflixShow/NetflixShow';
import SignUpPage from './pages/SignUp/SignUpPage';
import SignInPage from './pages/SignIn/SignInPage';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage';
import BrowsePage from './pages/Browse/BrowsePage';
import ProfilePage from './pages/Profile/ProfilePage';
import TVShowsPage from './pages/Browse/TVShowsPage';
import MoviesPage from './pages/Browse/MoviesPage';
import NewPopularPage from './pages/Browse/NewPopularPage';
import MyListPage from './pages/Browse/MyListPage';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { SupabaseProvider } from './context/SupabaseProvider';

// Loading component for suspense fallback
const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
    </div>
  );
};

function App() {
  // Create router with future flags enabled to address warnings
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<NetflixHome />} />
        <Route path="/netflix-show" element={<NetflixShow />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile" element={
          <Suspense fallback={<Loading />}>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/browse" element={
          <Suspense fallback={<Loading />}>
            <ProtectedRoute>
              <BrowsePage />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/browse/tv-shows" element={
          <Suspense fallback={<Loading />}>
            <ProtectedRoute>
              <TVShowsPage />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/browse/movies" element={
          <Suspense fallback={<Loading />}>
            <ProtectedRoute>
              <MoviesPage />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/browse/new-popular" element={
          <Suspense fallback={<Loading />}>
            <ProtectedRoute>
              <NewPopularPage />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/browse/my-list" element={
          <Suspense fallback={<Loading />}>
            <ProtectedRoute>
              <MyListPage />
            </ProtectedRoute>
          </Suspense>
        } />
      </>
    ),
    // Define router options
    {
      future: {
        // These are the supported future flags in the current version
        v7_normalizeFormMethod: true
      }
    }
  );

  return (
    <SupabaseProvider>
      <AuthProvider>
        <Toaster position="top-center" />
        <RouterProvider router={router} />
      </AuthProvider>
    </SupabaseProvider>
  );
}

export default App;