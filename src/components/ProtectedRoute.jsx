import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  console.log('🔒 ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    console.log('🔒 ProtectedRoute showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('🔒 ProtectedRoute allowing access, rendering children');
    return children;
  } else {
    console.log('🔒 ProtectedRoute redirecting to login');
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
