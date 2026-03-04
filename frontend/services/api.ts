import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { UserProfile } from '../types';

/**
 * API Service for CasperID Backend Integration
 * Connects frontend to the new backend server with authentication, verification, and MetaMask features
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  history?: any;
  devices?: any[];
  [key: string]: any;
}

export interface AuthTokens {
  sessionToken: string;
  expiresAt: number;
}

class ApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // In development, we use the VITE_API_URL (usually localhost:3001).
    // On mobile via ngrok, we must use relative paths to go through the proxy.
    const isLocalhost = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    this.baseURL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:3001' : '');

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page for API calls
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    // NOTE: Authentication is handled via httpOnly cookies (withCredentials: true)
    // No need to manually add Authorization header - cookies are sent automatically
    this.client.interceptors.request.use(
      (config) => {
        // Cookies are sent automatically with withCredentials: true
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          // Session expired - clear local state
          // The httpOnly cookie will be cleared by the server or expire naturally
          this.clearTokens();
          // Don't auto-redirect to prevent loops with public profiles
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================
  //
  // SECURITY: Tokens are now stored in httpOnly cookies set by the server.
  // This protects against XSS attacks as JavaScript cannot access httpOnly cookies.
  // The server sets the cookie in /api/passkey/register/finish and /api/passkey/auth/finish.
  // We use withCredentials: true to send cookies with requests automatically.
  //
  // For backwards compatibility during migration, we also check sessionStorage
  // (NOT localStorage) as a fallback for session expiry tracking only.
  // ============================================

  public setTokens(tokens: AuthTokens) {
    // The server sets httpOnly cookies automatically.
    // We only track expiry time in sessionStorage for UI purposes (e.g., showing session timeout warnings)
    // sessionStorage is cleared on tab close, which is safer than localStorage
    try {
      sessionStorage.setItem('casperid_session_expiry', tokens.expiresAt.toString());
    } catch {
      // sessionStorage may be unavailable in some contexts
    }
  }

  public getTokens(): AuthTokens | null {
    // We can't access the actual token (it's in httpOnly cookie)
    // Only return expiry info for UI purposes
    try {
      const expiresAtStr = sessionStorage.getItem('casperid_session_expiry');
      if (expiresAtStr) {
        return {
          sessionToken: '[httpOnly]', // Placeholder - actual token is in cookie
          expiresAt: parseInt(expiresAtStr, 10)
        };
      }
    } catch {
      // sessionStorage may be unavailable
    }
    return null;
  }

  private clearTokens() {
    try {
      sessionStorage.removeItem('casperid_session_expiry');
      // Clean up legacy localStorage tokens if they exist
      localStorage.removeItem('casperid_session_token');
      localStorage.removeItem('casperid_token_expires');
    } catch {
      // Storage may be unavailable
    }
  }

  public async logout() {
    try {
      // Server will clear the httpOnly cookie
      await this.client.post('/api/passkey/logout');
    } catch {
      // Logout failed silently - cookie will expire naturally
    } finally {
      this.clearTokens();
    }
  }

  public isAuthenticated(): boolean {
    // Check session expiry from sessionStorage
    try {
      const expiresAtStr = sessionStorage.getItem('casperid_session_expiry');
      if (!expiresAtStr) {
        return false;
      }
      return Date.now() < parseInt(expiresAtStr);
    } catch {
      return false;
    }
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // PASSKEY AUTHENTICATION
  // ============================================

  async passkeyRegisterInit(email: string, displayName: string, crossDevice?: boolean): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/register/begin', {
        email,
        name: displayName,
        crossDevice
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async passkeyRegisterStatus(userId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.get(`/api/passkey/register/${userId}/status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkDeviceFingerprint(deviceFingerprint: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/device/check', {
        deviceFingerprint
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async passkeyRegisterComplete(credentialResponse: any): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/register/finish', credentialResponse);
      // Registration now creates session - store tokens
      if (response.data.success && response.data.sessionToken && response.data.expiresAt) {
        this.setTokens({
          sessionToken: response.data.sessionToken,
          expiresAt: new Date(response.data.expiresAt).getTime()
        });
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async passkeyAuthInit(email?: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/auth/begin', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async passkeyAuthComplete(credentialResponse: any): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/auth/finish', credentialResponse);
      if (response.data.success && response.data.sessionToken && response.data.expiresAt) {
        this.setTokens({
          sessionToken: response.data.sessionToken,
          expiresAt: new Date(response.data.expiresAt).getTime()
        });
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // QR CODE PAIRING
  // ============================================

  async generateQRPairing(userId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.get(`/api/passkey/qr-pair/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async completePairing(pairingToken: string, deviceInfo: any): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/complete-pairing', {
        pairing_token: pairingToken,
        device_info: deviceInfo
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // OTP PAIRING (Extension-to-Web)
  // ============================================

  /**
   * Initiate OTP pairing from extension
   * @param cid - CasperID username or email
   */
  async initiateOTPPairing(cid: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/pairing/otp/start', { cid });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify OTP and complete pairing
   * @param pairingId - The pairing session ID
   * @param otp - The 3-digit OTP
   * @param deviceInfo - Optional device information
   */
  async verifyOTPPairing(pairingId: string, otp: string, deviceInfo?: any): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/pairing/otp/verify', {
        pairingId,
        otp,
        deviceInfo
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get pending OTP pairing requests (for web portal)
   */
  async getOTPPendingPairings(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/passkey/pairing/otp/pending');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a pending OTP pairing request
   * @param pairingId - The pairing session ID to cancel
   */
  async cancelOTPPairing(pairingId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete(`/api/passkey/pairing/otp/${pairingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // PENDING SESSION (Mobile Passkey Handoff)
  // ============================================

  async createPendingSession(email: string, type: 'registration' | 'login' = 'registration'): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/pending-session/create', { email, type });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPendingSession(sessionId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.get(`/api/pending-session/${sessionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async completePendingSession(sessionId: string, credentialData: any): Promise<ApiResponse> {
    try {
      const response = await this.client.post(`/api/pending-session/${sessionId}/complete`, credentialData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPendingSessionStatus(sessionId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.get(`/api/pending-session/${sessionId}/status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // METAMASK INTEGRATION
  // ============================================

  async linkMetaMaskAccount(metamaskAddress: string, signature: string, message: string, chainId?: number): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/metamask/link-account', {
        metamask_address: metamaskAddress,
        signature,
        message,
        chainId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async linkCasperAccount(public_key: string, signature: string, message: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/metamask/link-account', {
        metamask_address: public_key, // Reusing field for convenience or we can add new ones
        signature,
        message,
        chain: 'casper'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async unlinkMetaMaskAccount(): Promise<ApiResponse> {
    try {
      const response = await this.client.delete('/api/metamask/unlink-account');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async unlinkWallet(address: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete(`/api/metamask/unlink-wallet/${address}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserPermissions(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/metamask/user/permissions');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async revokePermission(grantId: string, reason: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete(`/api/metamask/user/permissions/${grantId}`, {
        data: { reason }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePermission(grantId: string, permissions: any[]): Promise<ApiResponse> {
    try {
      const response = await this.client.patch(`/api/metamask/user/permissions/${grantId}`, { permissions });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportData(): Promise<any> {
    try {
      const response = await this.client.post('/api/metamask/user/export-data');
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // DEVICE MANAGEMENT
  // ============================================

  async getDevices(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/passkey/devices');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async revokeDevice(credentialId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete(`/api/passkey/devices/${credentialId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // VERIFICATION FLOWS
  // ============================================

  async requestVerification(tier: 'layer_2' | 'layer_3', requestedFields: string[], purpose: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/v2/verification/request', {
        verification_tier: tier,
        requested_fields: requestedFields,
        purpose
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getVerificationStatus(requestId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.get(`/api/v2/verification/status/${requestId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async shareKYCData(fields: string[]): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/v2/verification/share', { fields });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadDocument(file: File, documentType: string): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', documentType);

      const response = await this.client.post('/api/v2/verification/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async submitLivenessCheck(livenessData: any): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/v2/verification/liveness', livenessData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  async getSessionStatus(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/passkey/session');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // OTP AUTHENTICATION
  // ============================================

  async sendOTP(email: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/auth/send-otp', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyOTP(verificationId: string, otp: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/auth/verify-otp', {
        verificationId,
        otp
      });

      // Store session token if returned (Email Login)
      if (response.data.success && response.data.sessionToken && response.data.expiresAt) {
        this.setTokens({
          sessionToken: response.data.sessionToken,
          expiresAt: new Date(response.data.expiresAt).getTime()
        });
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resendOTP(verificationId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/auth/resend-otp', {
        verificationId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // WALLET GENERATION
  // ============================================

  async generateWallet(): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/wallet/generate');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async mintDID(): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/did/mint');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportDID(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/passkey/did/export');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateBackupKeys(): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/security/backup-keys');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async initializeSecurity(securityData: any): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/security/initialize', securityData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async recordAccountCreation(): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/analytics/account-created');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getHumanId(walletAddress: string): Promise<ApiResponse> {
    try {
      const response = await this.client.get(`/api/profile/human-id/${walletAddress}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getVerificationHistory(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/v2/verification/history');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // USER PROFILE
  // ============================================

  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await this.client.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }


  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await this.client.put('/api/user/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRandomBanner(): Promise<{ imageUrl: string }> {
    try {
      const response = await this.client.get('/api/random-banner');
      return response.data;
    } catch {
      // Fallback to default banner on error
      return { imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200' };
    }
  }

  async uploadProfilePicture(file: File, wallet?: string): Promise<{ profile: UserProfile; imageUrl: string }> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await this.client.post(`/api/profile/${targetWallet}/upload-avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // PROFILE SUB-RESOURCES (Experience, Education, etc.)
  // ============================================

  // Helper to get wallet address from user profile if not provided
  private async getWalletForRequest(wallet?: string): Promise<string> {
    if (wallet) return wallet;

    try {
      const profile = await this.getUserProfile();

      // Handle direct profile object (normal case)
      if (profile && profile.wallet) {
        return profile.wallet;
      }

      // If we get here, profile exists but no wallet
      throw new Error('Wallet not created. Please complete onboarding to create your profile.');

    } catch (error: any) {
      // Handle specific backend errors
      if (error.message?.includes('Wallet not created')) {
        throw new Error('Wallet not created. Please complete onboarding to create your profile.');
      }

      throw new Error('User profile not found or wallet address not available. Please ensure you are logged in and have completed profile setup.');
    }
  }

  // --- Experience ---
  async getExperience(wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.get(`/api/profile/${targetWallet}/experience`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addExperience(experienceData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.post(`/api/profile/${targetWallet}/experience`, experienceData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateExperience(id: string, experienceData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.put(`/api/profile/${targetWallet}/experience/${id}`, experienceData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteExperience(id: string, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.delete(`/api/profile/${targetWallet}/experience/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // --- Education ---
  async getEducation(wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.get(`/api/profile/${targetWallet}/education`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addEducation(educationData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.post(`/api/profile/${targetWallet}/education`, educationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateEducation(id: string, educationData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.put(`/api/profile/${targetWallet}/education/${id}`, educationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteEducation(id: string, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.delete(`/api/profile/${targetWallet}/education/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // --- Certifications ---
  async getCertifications(wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.get(`/api/profile/${targetWallet}/certifications`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addCertification(certData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.post(`/api/profile/${targetWallet}/certifications`, certData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCertification(id: string, certData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.put(`/api/profile/${targetWallet}/certifications/${id}`, certData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCertification(id: string, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.delete(`/api/profile/${targetWallet}/certifications/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // --- Skills ---
  async getSkills(wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.get(`/api/profile/${targetWallet}/skills`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addSkill(skillData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.post(`/api/profile/${targetWallet}/skills`, skillData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSkill(id: string, skillData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.put(`/api/profile/${targetWallet}/skills/${id}`, skillData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteSkill(id: string, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.delete(`/api/profile/${targetWallet}/skills/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // --- Projects ---
  async getProjects(wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.get(`/api/profile/${targetWallet}/projects`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addProject(projectData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.post(`/api/profile/${targetWallet}/projects`, projectData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProject(id: string, projectData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.put(`/api/profile/${targetWallet}/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProject(id: string, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.delete(`/api/profile/${targetWallet}/projects/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // --- Awards ---
  async getAwards(wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.get(`/api/profile/${targetWallet}/awards`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addAward(awardData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.post(`/api/profile/${targetWallet}/awards`, awardData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAward(id: string, awardData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.put(`/api/profile/${targetWallet}/awards/${id}`, awardData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAward(id: string, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.delete(`/api/profile/${targetWallet}/awards/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // --- Languages ---
  async getLanguages(wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.get(`/api/profile/${targetWallet}/languages`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addLanguage(languageData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.post(`/api/profile/${targetWallet}/languages`, languageData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateLanguage(id: string, languageData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.put(`/api/profile/${targetWallet}/languages/${id}`, languageData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteLanguage(id: string, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.delete(`/api/profile/${targetWallet}/languages/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // --- Volunteer ---
  async getVolunteers(wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.get(`/api/profile/${targetWallet}/volunteer`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addVolunteer(volunteerData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.post(`/api/profile/${targetWallet}/volunteer`, volunteerData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateVolunteer(id: string, volunteerData: any, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.put(`/api/profile/${targetWallet}/volunteer/${id}`, volunteerData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteVolunteer(id: string, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.delete(`/api/profile/${targetWallet}/volunteer/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // AI FEATURES
  // ============================================

  async parseResume(file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await this.client.post('/api/ai/parse-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for AI processing
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // INDEXER / ANALYTICS
  // ============================================

  async getIndexerStatus(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/indexer/status');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserEvents(address: string): Promise<ApiResponse> {
    try {
      const response = await this.client.get(`/api/indexer/user/${address}/events`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // ACCOUNT & SETTINGS
  // ============================================

  async deleteAccount(): Promise<ApiResponse> {
    try {
      const response = await this.client.delete('/api/auth/account');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    } finally {
      this.clearTokens();
    }
  }

  async getNotificationPreferences(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/notifications/preferences');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateNotificationPreferences(preferences: any): Promise<ApiResponse> {
    try {
      const response = await this.client.patch('/api/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotifications(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/notifications');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post(`/api/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAccessLogs(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/notifications/access-logs');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  private handleError(error: any): Error {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return new Error(message);
  }

  // ============================================
  // GENERIC HTTP METHODS
  // ============================================

  async post(url: string, data?: any): Promise<any> {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async get(url: string): Promise<any> {
    try {
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // LAYER 3 VERIFICATION (FULL KYC)
  // ============================================

  /**
   * Upload document and extract data with OCR
   */
  public async uploadDocumentWithOCR(
    frontImage: File,
    backImage: File | null,
    documentType: 'passport' | 'drivers_license' | 'national_id'
  ): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('front_image', frontImage);
      if (backImage) {
        formData.append('back_image', backImage);
      }
      formData.append('document_type', documentType);

      const response = await this.client.post(
        '/api/v2/verification/layer3/documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Submit Layer 3 verification request for admin review
   */
  public async submitLayer3Verification(data: {
    document_data: {
      document_type: string;
      document_number: string;
      first_name: string;
      last_name: string;
      date_of_birth: string;
      gender: string;
      nationality: string;
      address: string;
      phone_number: string;
    };
    upload_id: string;
    liveness_verified: boolean;
  }): Promise<ApiResponse> {
    try {
      const response = await this.client.post(
        '/api/v2/verification/layer3/submit',
        data
      );

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  public getBaseURL(): string {
    return this.baseURL;
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  // ============================================
  // ACTIVITY LOG
  // ============================================

  async getActivityLog(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    activities: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    try {
      const response = await this.client.get('/api/activity-log', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPublicProfile(identifier: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/public-profile/${identifier}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getActivityDetail(id: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/activity-log/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async clearProfileCategory(category: string, wallet?: string): Promise<ApiResponse> {
    try {
      const targetWallet = await this.getWalletForRequest(wallet);
      const response = await this.client.delete(`/api/profile/${targetWallet}/batch-clear/${category}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ ADMIN API METHODS ============

  async loginAdmin(username: string, password: string): Promise<{ token: string; admin: any }> {
    try {
      const response = await this.client.post('/api/admin/login', { username, password });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getVerificationRequests(token: string, status?: string): Promise<{ requests: any[] }> {
    try {
      const url = status ? `/api/admin/verification-requests?status=${status}` : '/api/admin/verification-requests';
      const response = await this.client.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async issueCredential(token: string, requestId: string, approve: boolean): Promise<any> {
    try {
      const response = await this.client.post('/api/admin/issue-credential',
        { request_id: requestId, approve },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // --- Admin Quest Management ---

  async getAdminQuests(): Promise<{ success: boolean; quests: any[] }> {
    try {
      const response = await this.client.get('/api/quest/admin/list');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addQuest(questData: any): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/quest/admin/add', questData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateQuest(id: string, questData: any): Promise<ApiResponse> {
    try {
      const response = await this.client.put(`/api/quest/admin/update/${id}`, questData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteQuest(id: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete(`/api/quest/admin/delete/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // CONTEXT DID MANAGEMENT
  // ============================================

  async createContextDID(context: string, alias: string, disclosures: any, routingType?: 'identity' | 'wallet', targetWallet?: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/passkey/context-did/create', {
        context,
        alias,
        disclosures,
        routingType,
        targetWallet
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getContextDIDs(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/passkey/context-did/list');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================
  // CNS (CasperID Name Service)
  // ============================================

  async checkCnsAvailability(name: string): Promise<ApiResponse> {
    try {
      const response = await this.client.get(`/api/cns/check/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async registerCns(name: string, years: number): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/cns/register', {
        name,
        years
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyNames(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/cns/my-names');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCnsRoutes(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/cns/routes');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async saveCnsRoute(name: string, config: any): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/cns/route', {
        name,
        ...config
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resolveCnsName(name: string): Promise<ApiResponse> {
    try {
      const response = await this.client.get(`/api/resolve/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createSubName(parentName: string, prefix: string, contextType: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/cns/subname', {
        parentName,
        prefix,
        contextType
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export const apiClient = apiService; // Alias for compatibility with admin dashboard
export default apiService;