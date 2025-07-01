import { Suspense } from 'react';
import { Route, createRoutesFromElements, RouterProvider, createBrowserRouter } from 'react-router-dom';
import NetflixHome from './pages/Home/NetflixHome';
import NetflixShow from './pages/NetflixShow/NetflixShow';
import SignUpPage from './pages/SignUp/SignUpPage';
import SignInPage from './pages/SignIn/SignInPage';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage';
import BrowsePage from './pages/Browse/BrowsePage';
import ProfilePage from './pages/Profile/ProfilePage';
import SearchPage from './pages/SearchPage';
import UserListsPage from './pages/UserListsPage';
import TMDbLoginPage from './pages/TMDbLoginPage';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { SupabaseProvider } from './context/SupabaseProvider';
import { Analytics } from "@vercel/analytics/react"

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
        <Route path="/search" element={
          <Suspense fallback={<Loading />}>
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/my-lists" element={
          <Suspense fallback={<Loading />}>
            <ProtectedRoute>
              <UserListsPage />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/tmdb-login" element={
          <Suspense fallback={<Loading />}>
            <ProtectedRoute>
              <TMDbLoginPage />
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
        <Analytics />
      </AuthProvider>
    </SupabaseProvider>
  );
}

export default App;