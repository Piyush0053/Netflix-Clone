import { Suspense, useEffect } from 'react';
import { Route, createRoutesFromElements, RouterProvider, createBrowserRouter } from 'react-router-dom';
import NetflixHome from './pages/Home/NetflixHome';
import NetflixShow from './pages/NetflixShow/NetflixShow';
import SignUpPage from './pages/SignUp/SignUpPage';
import SignInPage from './pages/SignIn/SignInPage';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage';
import BrowsePage from './pages/Browse/BrowsePage';
import ProfilePage from './pages/Profile/ProfilePage';
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

// Error Boundary Component
const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-gray-400 mb-4">We're sorry, but something unexpected happened.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
      >
        Reload Page
      </button>
      <details className="mt-4 text-sm text-gray-500">
        <summary>Error details</summary>
        <pre className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-auto max-w-lg">
          {error.message}
        </pre>
      </details>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Set up global error handling
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

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
    {
      future: {
        v7_normalizeFormMethod: true
      }
    }
  );

  try {
    return (
      <SupabaseProvider>
        <AuthProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
          <RouterProvider router={router} />
          <Analytics />
        </AuthProvider>
      </SupabaseProvider>
    );
  } catch (error) {
    return <ErrorFallback error={error as Error} />;
  }
}

export default App;