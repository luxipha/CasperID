
import React, { useState } from 'react';
import { apiService } from '../services/api';

interface ExportDIDProps {
  onBack: () => void;
}

export const ExportDID: React.FC<ExportDIDProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [modal, setModal] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({
    show: false,
    type: 'success',
    message: ''
  });
  const [qrCode, setQrCode] = useState('');
  const [showQr, setShowQr] = useState(false);

  const sendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.post('/api/auth/send-verification-otp', {
        purpose: 'export-did'
      });

      if (response.success) {
        setOtpSent(true);
        // No alert needed - UI will show input box
      } else {
        setModal({
          show: true,
          type: 'error',
          message: response.error || 'Failed to send OTP. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setModal({
        show: true,
        type: 'error',
        message: error.response?.data?.error || 'Failed to send OTP. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otpCode.length !== 6) {
      setModal({
        show: true,
        type: 'error',
        message: 'Please enter a valid 6-digit OTP code.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.post('/api/auth/verify-verification-otp', {
        otp: otpCode,
        purpose: 'export-did'
      });

      if (response.success) {
        setVerificationToken(response.verificationToken);
        setStep(2);
      } else {
        setModal({
          show: true,
          type: 'error',
          message: response.error || 'Invalid OTP. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setModal({
        show: true,
        type: 'error',
        message: error.response?.data?.error || 'Failed to verify OTP. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadJSON = async () => {
    try {
      const response = await apiService.post('/api/auth/export-did', {
        verificationToken
      });

      if (response.success) {
        // Create downloadable JSON file with real date
        const now = new Date();
        const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS

        const jsonString = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `casperid-did-export-${dateString}_${timeString}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setModal({
          show: true,
          type: 'success',
          message: 'DID exported successfully!'
        });
      } else {
        setModal({
          show: true,
          type: 'error',
          message: response.error || 'Failed to export DID. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Error exporting DID:', error);
      setModal({
        show: true,
        type: 'error',
        message: error.response?.data?.error || 'Failed to export DID. Please try again.'
      });
    }
  };

  const generateQRCode = async () => {
    try {
      const response = await apiService.post('/api/auth/export-did', {
        verificationToken
      });

      if (response.success) {
        // Generate QR code with DID data
        const qrData = JSON.stringify({
          did: response.data.did,
          userId: response.data.userId,
          exportedAt: response.data.exportedAt,
          warning: "SENSITIVE: Do not share or photograph this QR code!"
        });
        setQrCode(qrData);
        setShowQr(true);
      } else {
        setModal({
          show: true,
          type: 'error',
          message: response.error || 'Failed to generate QR code. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      setModal({
        show: true,
        type: 'error',
        message: error.response?.data?.error || 'Failed to generate QR code. Please try again.'
      });
    }
  };

  const printRecoveryPhrase = async () => {
    try {
      const response = await apiService.post('/api/auth/export-did', {
        verificationToken
      });

      if (response.success) {
        // Create printable recovery document
        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>CasperID Recovery Document</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .warning { background: #fee; border: 2px solid #f00; padding: 15px; margin: 20px 0; }
              .data { background: #f5f5f5; padding: 15px; margin: 10px 0; }
              .footer { margin-top: 40px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>CasperID Recovery Document</h1>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="warning">
              <h3>⚠️ CRITICAL SECURITY WARNING</h3>
              <p>Keep this document in a secure location. Anyone with access to this information can control your digital identity.</p>
            </div>
            
            <div class="data">
              <h3>DID Information:</h3>
              <p><strong>DID:</strong> ${response.data.did}</p>
              <p><strong>User ID:</strong> ${response.data.userId}</p>
              <p><strong>Wallet Address:</strong> ${response.data.walletAddress}</p>
              <p><strong>Recovery Email:</strong> ${response.data.recoveryEmail}</p>
            </div>
            
            <div class="footer">
              <p>CasperID - Decentralized Identity Platform</p>
              <p>For support, visit: https://casperid.io/support</p>
            </div>
          </body>
          </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow?.document.write(printContent);
        printWindow?.document.close();
        printWindow?.print();

        setModal({
          show: true,
          type: 'success',
          message: 'Recovery document prepared for printing!'
        });
      } else {
        setModal({
          show: true,
          type: 'error',
          message: response.error || 'Failed to prepare recovery document. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Error preparing recovery document:', error);
      setModal({
        show: true,
        type: 'error',
        message: error.response?.data?.error || 'Failed to prepare recovery document. Please try again.'
      });
    }
  };

  const renderStep1 = () => (
    <div className="w-full max-w-[800px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#626D85] hover:text-primary transition-colors font-bold text-sm group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to DID Management
        </button>
        <div className="text-[11px] font-black text-[#626D85] uppercase tracking-[0.2em] opacity-60">
          STEP <span className="text-primary">1</span> of 3
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(134,82,226,0.1)] overflow-hidden">
        <div className="p-12 flex flex-col items-center text-center">
          {/* Lock Icon */}
          <div className="size-24 rounded-full bg-indigo-50 flex items-center justify-center text-primary mb-8 relative">
            <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse"></div>
            <span className="material-symbols-outlined text-[44px] icon-filled relative z-10">lock_person</span>
          </div>

          <h2 className="text-[36px] font-black text-[#1A1A2E] mb-4 tracking-tight leading-none">Confirm Your Identity to Export Keys</h2>
          <p className="text-[#626D85] text-[15px] font-medium leading-relaxed max-w-xl mb-10">
            For your security, please re-authenticate to proceed with exporting your cryptographic keys. This ensures only you can access your sensitive identity data.
          </p>

          {/* Warning Banner */}
          <div className="w-full bg-red-50/50 border border-red-100/50 rounded-2xl p-6 flex gap-4 text-left mb-10">
            <span className="material-symbols-outlined text-red-500 text-[24px]">warning</span>
            <div>
              <h4 className="font-bold text-red-900 text-[14px] leading-tight mb-1">Warning: Sensitive Action</h4>
              <p className="text-[12px] text-red-800 font-medium leading-relaxed">
                Keep your exported keys extremely secure. Loss or compromise could lead to loss of identity control.
              </p>
            </div>
          </div>

          {/* Auth Methods Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-0 border-t border-gray-50">
            {/* Passkey Column */}
            <div className="p-8 space-y-8 flex flex-col">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[24px]">fingerprint</span>
                <h3 className="text-[16px] font-bold text-[#1A1A2E]">Passkey Authentication</h3>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[24px] p-8 space-y-6">
                <p className="text-[13px] text-[#626D85] font-medium leading-relaxed">
                  Use your device's biometric sensor (FaceID, TouchID) or security key.
                </p>
                <button
                  disabled
                  className="w-full h-14 bg-gray-300 text-gray-500 rounded-[18px] font-black text-sm flex items-center justify-center gap-3 cursor-not-allowed opacity-50"
                >
                  Authenticate with Device
                  <span className="material-symbols-outlined text-[20px]">block</span>
                </button>
              </div>
            </div>

            {/* OR Divider */}
            <div className="flex items-center justify-center py-4 md:py-0">
              <div className="size-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-[#626D85] shadow-sm relative z-10">OR</div>
              <div className="hidden md:block absolute h-[300px] w-px bg-gray-50"></div>
            </div>

            {/* OTP Column */}
            <div className="p-8 space-y-8 flex flex-col">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#626D85] text-[24px]">sms</span>
                <h3 className="text-[16px] font-bold text-[#1A1A2E]">OTP Authentication</h3>
              </div>
              <div className="flex-1 space-y-4 pt-4">
                {!otpSent ? (
                  <>
                    <div className="space-y-2 text-left">
                      <p className="text-[13px] text-[#626D85] font-medium leading-relaxed">
                        We'll send a 6-digit verification code to your registered email or phone number.
                      </p>
                    </div>
                    <button
                      onClick={sendOTP}
                      disabled={isLoading}
                      className="w-full h-14 bg-white border border-gray-200 text-[#1A1A2E] hover:bg-gray-50 rounded-[18px] font-black text-sm transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </div>
                      ) : 'Send OTP'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 text-left">
                      <label className="text-[11px] font-bold text-[#626D85] uppercase tracking-widest">Enter OTP Code</label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary/30 text-sm font-medium transition-all outline-none text-center tracking-[0.5em]"
                          placeholder="000000"
                          maxLength={6}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#626D85]/40">
                          <span className="material-symbols-outlined text-[20px]">timer</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#626D85] font-medium">
                        Check your registered email or phone for the 6-digit code
                      </p>
                    </div>
                    <button
                      onClick={verifyOTP}
                      disabled={isLoading || otpCode.length !== 6}
                      className="w-full h-14 bg-white border border-gray-200 text-[#1A1A2E] hover:bg-gray-50 rounded-[18px] font-black text-sm transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <div className="text-center">
                      <button
                        onClick={sendOTP}
                        className="text-[13px] font-bold text-primary hover:underline"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="bg-[#F8F9FB] py-6 text-center border-t border-gray-50">
          <button
            onClick={onBack}
            className="text-[14px] font-bold text-[#626D85] hover:text-[#1A1A2E] transition-colors"
          >
            Cancel Export
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="w-full max-w-[800px] mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-2 text-[#626D85] hover:text-primary transition-colors font-bold text-sm group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Step 1
        </button>
        <div className="text-[11px] font-black text-[#626D85] uppercase tracking-[0.2em] opacity-60">
          STEP <span className="text-primary">2</span> of 3
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(134,82,226,0.1)] overflow-hidden">
        <div className="p-12 flex flex-col items-center text-center">
          {/* Download Icon */}
          <div className="size-24 rounded-full bg-blue-50 flex items-center justify-center text-[#4C82FB] mb-8 relative">
            <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-pulse"></div>
            <span className="material-symbols-outlined text-[44px] relative z-10">download</span>
          </div>

          <h2 className="text-[36px] font-black text-[#1A1A2E] mb-4 tracking-tight leading-none">Select Key Export Method</h2>
          <p className="text-[#626D85] text-[15px] font-medium leading-relaxed max-w-xl mb-10">
            Choose a secure method to export your cryptographic keys for backup. Ensure physical security of your exported file.
          </p>

          {/* Warning Banner */}
          <div className="w-full bg-red-50/50 border border-red-100/50 rounded-2xl p-6 flex gap-4 text-left mb-10">
            <span className="material-symbols-outlined text-red-500 text-[24px]">warning</span>
            <div>
              <h4 className="font-bold text-red-900 text-[14px] leading-tight mb-1">Critical Warning</h4>
              <p className="text-[12px] text-red-800 font-medium leading-relaxed">
                Loss or compromise of these keys will lead to permanent loss of your digital identity and assets.
              </p>
            </div>
          </div>

          {/* Export Options */}
          <div className="w-full space-y-4">
            {/* JSON File Option */}
            <div className="p-8 rounded-[32px] border border-primary/20 bg-primary/[0.02] flex items-center justify-between gap-6 group hover:bg-primary/[0.04] transition-all">
              <div className="flex items-center gap-6">
                <div className="size-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">description</span>
                </div>
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[17px] font-black text-[#1A1A2E]">Download Encrypted JSON File</h4>
                    <span className="px-2.5 py-1 rounded bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">Recommended</span>
                  </div>
                  <p className="text-[13px] text-[#626D85] font-medium max-w-md leading-relaxed">
                    Download a password-protected JSON file containing your DID document and private keys.
                  </p>
                </div>
              </div>
              <button
                onClick={downloadJSON}
                className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-[18px] font-black text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] whitespace-nowrap"
              >
                Download JSON
                <span className="material-symbols-outlined text-[20px]">download</span>
              </button>
            </div>

            {/* QR Code Option */}
            <div className="p-8 rounded-[32px] border border-gray-100 bg-white flex items-center justify-between gap-6 group hover:bg-gray-50/50 transition-all">
              <div className="flex items-center gap-6">
                <div className="size-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#626D85] shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">qr_code_2</span>
                </div>
                <div className="text-left space-y-1">
                  <h4 className="text-[17px] font-black text-[#1A1A2E]">Display QR Code (for Manual Scan)</h4>
                  <p className="text-[13px] text-[#626D85] font-medium max-w-md leading-relaxed">
                    Display a QR code containing your private key for secure manual transfer. <span className="text-red-500 font-bold">(Do not photograph this screen!)</span>
                  </p>
                </div>
              </div>
              <button
                onClick={generateQRCode}
                className="h-14 px-8 bg-white border border-gray-200 text-[#1A1A2E] hover:bg-gray-50 rounded-[18px] font-black text-sm transition-all active:scale-[0.98] shadow-sm whitespace-nowrap"
              >
                Generate QR Code
              </button>
            </div>

            {/* Print Option */}
            <div className="p-8 rounded-[32px] border border-gray-100 bg-white flex items-center justify-between gap-6 group hover:bg-gray-50/50 transition-all">
              <div className="flex items-center gap-6">
                <div className="size-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#626D85] shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">print</span>
                </div>
                <div className="text-left space-y-1">
                  <h4 className="text-[17px] font-black text-[#1A1A2E]">Print Recovery Phrase</h4>
                  <p className="text-[13px] text-[#626D85] font-medium max-w-md leading-relaxed">
                    Generate a printable paper wallet with your recovery phrase.
                  </p>
                </div>
              </div>
              <button
                onClick={printRecoveryPhrase}
                className="h-14 px-8 bg-white border border-gray-200 text-[#1A1A2E] hover:bg-gray-50 rounded-[18px] font-black text-sm transition-all active:scale-[0.98] shadow-sm whitespace-nowrap"
              >
                Generate & Print
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="bg-[#F8F9FB] py-6 text-center border-t border-gray-50">
          <button
            onClick={onBack}
            className="text-[14px] font-bold text-[#626D85] hover:text-[#1A1A2E] transition-colors"
          >
            Cancel Export
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full pb-12">
      {step === 1 ? renderStep1() : renderStep2()}

      {/* Native Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className={`size-12 rounded-full flex items-center justify-center ${modal.type === 'success' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                }`}>
                <span className="material-symbols-outlined text-[24px]">
                  {modal.type === 'success' ? 'check_circle' : 'error'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-text-main">
                  {modal.type === 'success' ? 'Success!' : 'Error'}
                </h3>
              </div>
            </div>
            <p className="text-text-sub font-medium mb-8 leading-relaxed">
              {modal.message}
            </p>
            <button
              onClick={() => setModal({ ...modal, show: false })}
              className="w-full h-12 bg-primary text-white rounded-[16px] font-black text-sm hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-text-main mb-2">Your DID QR Code</h3>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <p className="text-red-800 font-bold text-sm">
                  ⚠️ WARNING: Do not photograph or share this QR code!
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center mb-6 bg-gray-50 rounded-2xl p-8">
              <div className="bg-white p-4 rounded-lg">
                {/* QR Code would be rendered here with a QR library */}
                <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 font-bold">QR Code</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowQr(false)}
                className="flex-1 h-12 bg-gray-100 text-gray-700 rounded-[16px] font-black text-sm hover:bg-gray-200 transition-all active:scale-[0.98]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrCode);
                  setModal({ show: true, type: 'success', message: 'QR data copied to clipboard!' });
                  setShowQr(false);
                }}
                className="flex-1 h-12 bg-primary text-white rounded-[16px] font-black text-sm hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                Copy Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
