import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiService, ApiResponse } from '../services/api';

// Utility function to convert ArrayBuffer to base64url
function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Utility function to convert base64url to ArrayBuffer
function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
  // Add padding if needed
  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/') + padding;

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

function getReadablePasskeyError(error: unknown): string {
  const fallbackMessage = 'Passkey sign-in failed. Please try again.';
  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  const normalizedMessage = error.message.toLowerCase();
  const domErrorName = (error as DOMException).name;

  const isRpIdMismatch =
    domErrorName === 'SecurityError' ||
    normalizedMessage.includes('operation is insecure') ||
    normalizedMessage.includes('relying party id') ||
    normalizedMessage.includes('registrable domain suffix') ||
    normalizedMessage.includes('wrong content-type');

  if (isRpIdMismatch) {
    return 'This passkey was created on a different CasperID domain. Open the matching domain for this account, or create a new passkey on this local environment.';
  }

  if (domErrorName === 'NotAllowedError') {
    return 'Passkey sign-in was cancelled or not approved on this device.';
  }

  return error.message || fallbackMessage;
}

export interface User {
  user_id: string;
  email: string;
  display_name: string;
  tier: 'layer_0' | 'layer_1' | 'layer_2' | 'layer_3';
  wallet?: string;
  metamask_address?: string;
  metamask_connected: boolean;
  points?: number;
  email_verified?: boolean;
  human_id?: string;
  cns_name?: string;
  kyc_completed_at?: string;
  liveness_completed_at?: string;
  linked_wallets?: Array<{
    chain: 'casper' | 'ethereum' | 'solana' | 'bitcoin';
    address: string;
    verified: boolean;
    verified_at?: string;
  }>;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  headline?: string;
  about?: string;
  city?: string;
  country?: string;
  phone_number?: string;
  website?: string;
  pronouns?: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    website?: string;
  };
  data_availability?: {
    experience: boolean;
    education: boolean;
    certifications: boolean;
    skills: boolean;
    projects: boolean;
    awards: boolean;
    languages: boolean;
    volunteer: boolean;
  };
  created_at: string;
  last_login: string;
  did_address?: string;
  profile_image_url?: string;
  context_dids?: Array<{
    did: string;
    alias?: string;
    context: string;
    disclosures?: Record<string, boolean>;
    created_at?: string;
  }>;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Authentication methods
  login: (email?: string, skipNativePrompt?: boolean) => Promise<{ success: boolean; deviceType?: string; transports?: string[]; user?: User }>;
  logout: () => Promise<void>;
  register: (email: string, displayName: string) => Promise<void>;

  // Profile methods
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<User | null>;

  // MetaMask integration
  linkMetaMask: (address: string, signature: string, message: string) => Promise<void>;
  unlinkMetaMask: () => Promise<void>;

  // Utility
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User state is the source of truth - populated by server validation via httpOnly cookie
  const isAuthenticated = !!user;

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Always attempt to validate session with server
      // The httpOnly cookie is sent automatically with the request
      // Don't rely solely on sessionStorage (which is tab-specific)
      try {
        const sessionResponse = await apiService.getSessionStatus();
        if (sessionResponse.success && sessionResponse.userAccount) {
          // Valid session - refresh user data
          await refreshUser();
        } else {
          // No valid session
          setUser(null);
        }
      } catch {
        // Server returned error (401, etc.) - no valid session
        setUser(null);
      }
    } catch {
      setError('Failed to initialize authentication');
      apiService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      // Get session status from backend
      const sessionResponse = await apiService.getSessionStatus();

      if (sessionResponse.success && sessionResponse.userAccount) {
        const userAccount = sessionResponse.userAccount;

        // Fetch human-id if wallet exists
        let humanId;
        if (userAccount.wallet && userAccount.wallet !== 'pending_wallet' && userAccount.wallet !== 'undefined') {
          try {
            const humanIdResponse = await apiService.getHumanId(userAccount.wallet);
            humanId = humanIdResponse.success ? humanIdResponse.humanId : null;
          } catch {
            // Human ID fetch failed
          }
        }

        // Fetch full profile for data disclosure checks
        let profileData: any = {};
        if (userAccount.wallet && userAccount.wallet !== 'pending_wallet' && userAccount.wallet !== 'undefined') {
          try {
            profileData = await apiService.getUserProfile();
          } catch {
            // Profile fetch failed
          }
        }

        const user: User = {
          user_id: userAccount.user_id,
          email: userAccount.recovery_email,
          display_name: humanId || userAccount.display_name || userAccount.recovery_email.split('@')[0],
          human_id: humanId,
          tier: userAccount.tier,
          wallet: userAccount.wallet,
          points: userAccount.points || 0,
          metamask_connected: userAccount.metamask_connected || false,
          cns_name: userAccount.cns_name || '',
          kyc_completed_at: userAccount.kyc_completed_at || '',
          liveness_completed_at: userAccount.liveness_completed_at || '',
          linked_wallets: userAccount.linked_wallets || [],
          first_name: profileData?.first_name,
          last_name: profileData?.last_name,
          date_of_birth: profileData?.date_of_birth,
          headline: profileData?.headline,
          about: profileData?.about,
          city: profileData?.city,
          country: profileData?.country,
          phone_number: profileData?.phone_number,
          website: profileData?.website,
          pronouns: profileData?.pronouns,
          socials: profileData?.socials,
          data_availability: profileData?.data_availability || {},
          did_address: userAccount.did_address || profileData?.did_address,
          profile_image_url: profileData?.profile_image_url,
          context_dids: userAccount.context_dids || profileData?.context_dids || [],
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };

        setUser(user);
        setError(null);
        return user;
      } else {
        throw new Error('No valid session');
      }
    } catch {
      setUser(null);
      apiService.logout();
      return null;
    }
  }, []);

  const register = useCallback(async (email: string, displayName: string): Promise<void> => {
    try {
      setError(null);

      const initResponse = await apiService.passkeyRegisterInit(email, displayName);

      if (!initResponse.success) {
        throw new Error(initResponse.error || 'Failed to initialize registration');
      }

      if (!initResponse.options) {
        throw new Error('No credential creation options received');
      }

      const credentialCreationOptions = initResponse.options;
      const challenge = base64urlToArrayBuffer(credentialCreationOptions.challenge);

      const publicKeyCredentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          ...credentialCreationOptions,
          challenge,
          user: {
            ...credentialCreationOptions.user,
            id: base64urlToArrayBuffer(credentialCreationOptions.user.id),
          },
        },
      };

      const credential = await navigator.credentials.create(publicKeyCredentialCreationOptions) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      const formattedCredential = {
        id: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        type: credential.type,
        clientExtensionResults: {},
        response: {
          attestationObject: arrayBufferToBase64url(response.attestationObject),
          clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
        },
      };

      const getDeviceType = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)) {
          return /ipad|tablet/.test(userAgent) ? 'tablet' : 'mobile';
        }
        return 'desktop';
      };

      const registrationData = {
        userId: initResponse.userId,
        credential: formattedCredential,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          deviceType: getDeviceType(),
          deviceName: `${getDeviceType().charAt(0).toUpperCase() + getDeviceType().slice(1)} Device`
        }
      };

      const verifyResponse = await apiService.passkeyRegisterComplete(registrationData);

      if (!verifyResponse.success) {
        throw new Error(verifyResponse.error || 'Registration verification failed');
      }

      // Proactively refresh CSRF token now that we have a session cookie
      await apiService.refreshCsrfToken();

      await refreshUser();

    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshUser]);

  const login = useCallback(async (email?: string, skipNativePrompt: boolean = false): Promise<{ success: boolean, deviceType?: string, transports?: string[], user?: User }> => {
    try {
      setError(null);

      const initResponse = await apiService.passkeyAuthInit(email);

      if (!initResponse.success || !(initResponse as any).options) {
        throw new Error(initResponse.error || 'Failed to initialize authentication');
      }

      const deviceType = (initResponse as any).deviceType;
      const transports = (initResponse as any).transports || [];

      if (skipNativePrompt) {
        setIsLoading(false);
        return { success: true, deviceType, transports };
      }

      const challengeId = (initResponse as any).challengeId;
      if (!challengeId) {
        throw new Error('No challenge ID received from server');
      }

      const credentialRequestOptions = (initResponse as any).options;
      const challenge = base64urlToArrayBuffer(credentialRequestOptions.challenge);

      const publicKeyCredentialRequestOptions: CredentialRequestOptions = {
        publicKey: {
          ...credentialRequestOptions,
          challenge,
          allowCredentials: credentialRequestOptions.allowCredentials?.map((cred: any) => ({
            ...cred,
            id: base64urlToArrayBuffer(cred.id),
          })),
        },
      };

      const credential = await navigator.credentials.get(publicKeyCredentialRequestOptions) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Authentication was cancelled');
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      const authenticationResponse = {
        id: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        response: {
          authenticatorData: arrayBufferToBase64url(response.authenticatorData),
          clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
          signature: arrayBufferToBase64url(response.signature),
          userHandle: response.userHandle ? arrayBufferToBase64url(response.userHandle) : null,
        },
        type: credential.type,
        clientExtensionResults: {},
      };

      const completePayload = {
        challengeId,
        credential: authenticationResponse
      };

      const verifyResponse = await apiService.passkeyAuthComplete(completePayload);

      if (!verifyResponse.success) {
        throw new Error(verifyResponse.error || 'Authentication verification failed');
      }

      // Proactively refresh CSRF token now that we have a session cookie
      await apiService.refreshCsrfToken();

      const user = await refreshUser();

      return { success: true, deviceType, user: user || undefined };

    } catch (error: any) {
      const errorMessage = getReadablePasskeyError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await apiService.logout();
    setUser(null);
    setError(null);
    window.location.href = '/';
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<void> => {
    try {
      setError(null);
      const response = await apiService.updateUserProfile(data) as any;

      if (response && (response.success || response._id)) {
        await refreshUser();
      } else {
        throw new Error((response && response.error) || 'Failed to update profile');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshUser]);

  const linkMetaMask = useCallback(async (address: string, signature: string, message: string): Promise<void> => {
    try {
      setError(null);
      const response = await apiService.linkMetaMaskAccount(address, signature, message);

      if (response.success) {
        await refreshUser();
      } else {
        throw new Error(response.error || 'Failed to link MetaMask account');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to link MetaMask account';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshUser]);

  const unlinkMetaMask = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const response = await apiService.unlinkMetaMaskAccount();

      if (response.success) {
        await refreshUser();
      } else {
        throw new Error(response.error || 'Failed to unlink MetaMask account');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to unlink MetaMask account';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    register,
    updateProfile,
    refreshUser,
    linkMetaMask,
    unlinkMetaMask,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a minimal context to prevent crashes during development (hot reload)
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      login: async () => ({ success: false, deviceType: undefined, transports: undefined, user: undefined }),
      logout: async () => { },
      register: async () => { },
      updateProfile: async () => { },
      refreshUser: async () => null,
      linkMetaMask: async () => { },
      unlinkMetaMask: async () => { },
      clearError: () => { },
    } as AuthContextType;
  }
  return context;
};

export default AuthContext;
