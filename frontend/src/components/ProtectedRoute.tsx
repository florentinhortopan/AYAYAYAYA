import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRegistered?: boolean;
}

export default function ProtectedRoute({ children, requireRegistered = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRegistered && !user?.isRegistered) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

