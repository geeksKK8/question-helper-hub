
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// This hook redirects to the login page if the user is not authenticated
export default function useRequireAuth(redirectUrl = '/auth') {
  const { user, isLoading, session } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    // Only redirect if we're done loading and there's no session
    if (!isLoading && !session && !redirectAttempted) {
      setRedirectAttempted(true);
      navigate(redirectUrl);
    }
  }, [session, isLoading, navigate, redirectUrl, redirectAttempted]);

  return { user, isLoading, session };
}
