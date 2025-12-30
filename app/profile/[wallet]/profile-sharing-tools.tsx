'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/api-client';
import { generateProfileSlug } from '@/lib/seo-utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Share2, 
  Copy, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Link as LinkIcon,
  QrCode,
  Check,
  X
} from 'lucide-react';

interface ProfileSharingToolsProps {
  profile: UserProfile;
  walletOrHumanId: string;
}

export default function ProfileSharingTools({ profile, walletOrHumanId }: ProfileSharingToolsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const displayName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile.human_id || 'CasperID User';

  // Generate SEO-friendly URL for sharing
  const seoSlug = generateProfileSlug(profile);
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://casperid.com'}/profile/${seoSlug}`;
  
  const shareText = `Check out ${displayName}'s verified CasperID profile${profile.verification_status === 'verified' ? ' ✓' : ''}`;
  const shareTextWithUrl = `${shareText} ${profileUrl}`;

  const handleCopyUrl = async () => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return;
    
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(profileUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = profileUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Additional fallback
      try {
        const textArea = document.createElement('textarea');
        textArea.value = profileUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackError) {
        console.error('All copy methods failed:', fallbackError);
      }
    }
  };

  const handleShareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextWithUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleShareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  const handleShareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  const handleNativeShare = async () => {
    // Check if we're on the client side and navigator is available
    if (typeof window === 'undefined' || !navigator) {
      setShowShareMenu(true);
      return;
    }
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} - CasperID Profile`,
          text: shareText,
          url: profileUrl,
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  return (
    <>
      {/* Floating Share Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleNativeShare}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          size="icon"
        >
          <Share2 className="w-6 h-6" />
        </Button>
      </div>

      {/* Share Menu Modal */}
      {showShareMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white rounded-2xl p-6 relative">
            <Button
              onClick={() => setShowShareMenu(false)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="text-center mb-6">
              <Share2 className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Share Profile</h3>
              <p className="text-gray-500 text-sm">Share {displayName}'s CasperID profile</p>
            </div>

            {/* URL Copy Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile URL</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg border text-sm text-gray-600 truncate">
                  {profileUrl}
                </div>
                <Button
                  onClick={handleCopyUrl}
                  variant={copySuccess ? "default" : "outline"}
                  size="sm"
                  className={copySuccess ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                >
                  {copySuccess ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {copySuccess && (
                <p className="text-green-600 text-xs mt-1">URL copied to clipboard!</p>
              )}
            </div>

            {/* Social Media Sharing */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                onClick={handleShareToTwitter}
                variant="outline"
                className="flex items-center space-x-2 p-3 h-auto"
              >
                <Twitter className="w-5 h-5 text-blue-400" />
                <span>Twitter</span>
              </Button>

              <Button
                onClick={handleShareToLinkedIn}
                variant="outline"
                className="flex items-center space-x-2 p-3 h-auto"
              >
                <Linkedin className="w-5 h-5 text-blue-700" />
                <span>LinkedIn</span>
              </Button>

              <Button
                onClick={handleShareToFacebook}
                variant="outline"
                className="flex items-center space-x-2 p-3 h-auto"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Facebook</span>
              </Button>

              <Button
                onClick={() => setShowQRCode(true)}
                variant="outline"
                className="flex items-center space-x-2 p-3 h-auto"
              >
                <QrCode className="w-5 h-5 text-gray-600" />
                <span>QR Code</span>
              </Button>
            </div>

            {/* Human ID Display */}
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Human ID</div>
              <div className="font-mono text-blue-600 font-medium">{profile.human_id}</div>
              {profile.verification_status === 'verified' && (
                <div className="text-xs text-green-600 mt-1">✓ Verified Identity</div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-white rounded-2xl p-6 relative text-center">
            <Button
              onClick={() => setShowQRCode(false)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
            >
              <X className="w-4 h-4" />
            </Button>

            <QrCode className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">QR Code</h3>
            <p className="text-gray-500 text-sm mb-6">Scan to view profile</p>

            {/* QR Code Placeholder - In production, you'd use a QR code library */}
            <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="text-gray-400 text-sm text-center">
                <QrCode className="w-16 h-16 mx-auto mb-2 opacity-50" />
                QR Code<br />
                <span className="text-xs">{profile.human_id}</span>
              </div>
            </div>

            <Button
              onClick={handleCopyUrl}
              variant="outline"
              className="w-full"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Copy Link Instead
            </Button>
          </Card>
        </div>
      )}
    </>
  );
}