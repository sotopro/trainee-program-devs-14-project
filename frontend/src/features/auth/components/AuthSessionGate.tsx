import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAccessToken,
  useAuthActions,
  useIsAuthHydrated,
  useRefreshToken,
} from '../store/authStore';
import { isJwtExpired } from '../utils/token';
import { AuthLoading } from './AuthLoading';

type AuthSessionGateProps = {
  children: ReactNode;
};

export function AuthSessionGate({ children }: AuthSessionGateProps) {
  const navigate = useNavigate();
  const isHydrated = useIsAuthHydrated();
  const accessToken = useAccessToken();
  const refreshToken = useRefreshToken();
  const { logout, refreshSession } = useAuthActions();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const validateSession = async () => {
      if (!accessToken) {
        setIsCheckingSession(false);
        return;
      }

      if (!isJwtExpired(accessToken)) {
        setIsCheckingSession(false);
        return;
      }

      if (!refreshToken || isJwtExpired(refreshToken)) {
        logout();
        setIsCheckingSession(false);
        navigate('/login?session=expired', { replace: true });
        return;
      }

      try {
        await refreshSession();
      } catch {
        navigate('/login?session=expired', { replace: true });
      } finally {
        setIsCheckingSession(false);
      }
    };

    void validateSession();
  }, [accessToken, isHydrated, logout, navigate, refreshSession, refreshToken]);

  if (!isHydrated || isCheckingSession) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}
