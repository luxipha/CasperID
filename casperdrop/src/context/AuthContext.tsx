import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AuthUser {
  sessionToken: string;
  businessToken?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  handleAuthSuccess: (sessionToken: string, data?: { businessToken?: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleAuthSuccess = useCallback(
    (sessionToken: string, data?: { businessToken?: string }) => {
      setUser({ sessionToken, businessToken: data?.businessToken });
      setIsModalOpen(false);
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isModalOpen, openModal, closeModal, handleAuthSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
