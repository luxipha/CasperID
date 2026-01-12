import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export interface User {
  user_id: string;
  email: string;
  display_name: string;
  tier: 'layer_0' | 'layer_1' | 'layer_2' | 'layer_3';
  wallet?: string;
  metamask_address?: string;
  metamask_connected: boolean;
  email_verified?: boolean;
  human_id?: string;
  cns_name?: string;
  kyc_completed_at?: string;
  liveness_completed_at?: string;
  created_at: string;
  last_login: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Authentication methods
  login: (email: string) => Promise<void>;
  logout: () => void;
  register: (email: string, displayName: string) => Promise<void>;

  // Profile methods
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;

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

  const isAuthenticated = !!user && apiService.isAuthenticated();

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Auth initialization started');
      console.log('🔍 apiService.isAuthenticated():', apiService.isAuthenticated());

      // Check if user has valid token
      if (apiService.isAuthenticated()) {
        console.log('🔍 Found stored token, attempting to refresh user...');
        await refreshUser();
      } else {
        console.log('🔍 No valid token found, setting user to null');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setError('Failed to initialize authentication');
      apiService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('🔍 Auth initialization complete, isLoading set to false');
    }
  };

  const refreshUser = async () => {
    try {
      // Get session status from backend
      const sessionResponse = await apiService.getSessionStatus();

      if (sessionResponse.success && sessionResponse.userAccount) {
        const userAccount = sessionResponse.userAccount;

        // Fetch human-id if wallet exists
        let humanId;
        if (userAccount.wallet) {
          try {
            console.log('🔍 Fetching human-id for wallet:', userAccount.wallet);
            const humanIdResponse = await apiService.getHumanId(userAccount.wallet);
            console.log('🔍 Human-id API response:', humanIdResponse);
            humanId = humanIdResponse.success ? humanIdResponse.humanId : null;
            console.log('🔍 Final humanId:', humanId);
          } catch (error) {
            console.warn('Failed to fetch human-id:', error);
          }
        }

        const user: User = {
          user_id: userAccount.user_id,
          email: userAccount.recovery_email,
          display_name: humanId || userAccount.recovery_email.split('@')[0],
          human_id: humanId,
          tier: userAccount.tier,
          wallet: userAccount.wallet,
          metamask_connected: userAccount.metamask_connected || false,
          cns_name: userAccount.cns_name || '',
          kyc_completed_at: userAccount.kyc_completed_at || '',
          liveness_completed_at: userAccount.liveness_completed_at || '',
          created_at: new Date().toISOString(), // Backend doesn't return this
          last_login: new Date().toISOString()   // Backend doesn't return this
        };

        setUser(user);
        setError(null);
        console.log('✅ User session restored:', user);
      } else {
        throw new Error('No valid session');
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      apiService.logout();
      throw error;
    }
  };

  const register = async (email: string, displayName: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Initialize passkey registration
      console.log('🔄 Calling passkeyRegisterInit with:', { email, displayName });

      const initResponse = await apiService.passkeyRegisterInit(email, displayName);

      console.log('📨 Registration init response:', initResponse);

      if (!initResponse.success) {
        console.error('❌ Registration init failed:', initResponse);
        throw new Error(initResponse.error || 'Failed to initialize registration');
      }

      if (!initResponse.options) {
        console.error('❌ No options in response:', initResponse);
        throw new Error('No credential creation options received');
      }

      // Step 2: Create WebAuthn credential
      const credentialCreationOptions = initResponse.options;
      console.log('🔑 Credential creation options:', credentialCreationOptions);

      // Convert base64url to ArrayBuffer for WebAuthn API
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

      // Step 3: Send credential to server for verification
      const response = credential.response as AuthenticatorAttestationResponse;

      console.log('🔐 Raw credential from browser:', {
        id: credential.id,
        rawId: credential.rawId,
        type: credential.type,
        response: {
          attestationObject: response.attestationObject,
          clientDataJSON: response.clientDataJSON
        }
      });

      // Format credential for SimpleWebAuthn library - exact format it expects
      const formattedCredential = {
        id: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId), // Convert ArrayBuffer to base64url
        type: credential.type,
        clientExtensionResults: {},
        response: {
          attestationObject: arrayBufferToBase64url(response.attestationObject),
          clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
        },
      };

      // Detect device type from user agent
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

      console.log('📤 Sending registration data:', JSON.stringify(registrationData, null, 2));

      const verifyResponse = await apiService.passkeyRegisterComplete(registrationData);

      if (!verifyResponse.success) {
        throw new Error(verifyResponse.error || 'Registration verification failed');
      }

      // Registration successful - user is now logged in!
      console.log('✅ Registration completed and user logged in!', verifyResponse);

      // User is now logged in - refresh user data and continue to onboarding
      await refreshUser();

      console.log('🚀 Ready to show OnboardingProgress component!');

    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email?: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Initialize authentication
      const initResponse = await apiService.passkeyAuthInit(email);

      if (!initResponse.success || !(initResponse as any).options) {
        throw new Error(initResponse.error || 'Failed to initialize authentication');
      }

      // Extract challengeId from init response
      const challengeId = (initResponse as any).challengeId;
      if (!challengeId) {
        throw new Error('No challenge ID received from server');
      }

      // Step 2: Get WebAuthn credential
      const credentialRequestOptions = (initResponse as any).options;

      // Convert base64url to ArrayBuffer
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

      // Step 3: Send credential to server for verification
      const response = credential.response as AuthenticatorAssertionResponse;

      // Format credential for SimpleWebAuthn library - convert ArrayBuffers to base64url
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

      // Include challengeId in the complete request
      const completePayload = {
        challengeId,
        credential: authenticationResponse
      };

      const verifyResponse = await apiService.passkeyAuthComplete(completePayload);

      if (!verifyResponse.success) {
        throw new Error(verifyResponse.error || 'Authentication verification failed');
      }

      // Authentication successful - fetch user profile
      await refreshUser();

    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.message || 'Authentication failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setError(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      setError(null);
      const response = await apiService.updateUserProfile(data) as any;

      if (response && (response.success || response._id)) {
        await refreshUser(); // Refresh to get updated data
      } else {
        throw new Error((response && response.error) || 'Failed to update profile');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const linkMetaMask = async (address: string, signature: string, message: string): Promise<void> => {
    try {
      setError(null);
      const response = await apiService.linkMetaMaskAccount(address, signature, message);

      if (response.success) {
        await refreshUser(); // Refresh to get updated MetaMask status
      } else {
        throw new Error(response.error || 'Failed to link MetaMask account');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to link MetaMask account';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const unlinkMetaMask = async (): Promise<void> => {
    try {
      setError(null);
      const response = await apiService.unlinkMetaMaskAccount();

      if (response.success) {
        await refreshUser(); // Refresh to get updated MetaMask status
      } else {
        throw new Error(response.error || 'Failed to unlink MetaMask account');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to unlink MetaMask account';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setError(null);
  };

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
    console.error('useAuth called outside AuthProvider - this usually happens during hot reload');
    // Return a minimal context to prevent crashes during development
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      login: async () => { },
      logout: () => { },
      register: async () => { },
      updateProfile: async () => { },
      refreshUser: async () => { },
      linkMetaMask: async () => { },
      unlinkMetaMask: async () => { },
      clearError: () => { },
    } as AuthContextType;
  }
  return context;
};

export default AuthContext;