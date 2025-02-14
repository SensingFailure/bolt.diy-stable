import { useEffect } from 'react';
import { useNavigate, useLocation } from '@remix-run/react';

interface AuthCheckProps {
  isAuthenticated: boolean;
}

export function AuthCheck({ isAuthenticated }: AuthCheckProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return null;
}
