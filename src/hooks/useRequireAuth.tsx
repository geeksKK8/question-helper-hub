
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// This hook redirects to the login page if the user is not authenticated
export default function useRequireAuth(redirectUrl = '/auth') {
  const { user, isLoading, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're done loading and there's no session
    if (!isLoading && !session) {
      navigate(redirectUrl);
    }
  }, [session, isLoading, navigate, redirectUrl]);

  return { user, isLoading, session };
}
