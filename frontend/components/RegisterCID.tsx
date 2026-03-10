import React, { useState, useEffect } from 'react';
import { CIDExplanationModal } from './ui/CIDexplantionModal';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface RegisterCIDProps {
  onBack: () => void;
}

type RegistrationStage = 'search' | 'payment' | 'processing' | 'success';

interface NameCheckResult {
  available: boolean;
  reason?: string;
}

export const RegisterCID: React.FC<RegisterCIDProps> = ({ onBack }) => {
  const { refreshUser } = useAuth();
  const [search, setSearch] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [checkResult, setCheckResult] = useState<NameCheckResult | null>(null);
  const [selectedYears, setSelectedYears] = useState(1); // Defaults to 1 for backward compatibility with backend expectations
  const [stage, setStage] = useState<RegistrationStage>('search');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'fiat'>('crypto');
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registeredName, setRegisteredName] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [lifetimeTimeLeft, setLifetimeTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  // Promo Code States
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<{ email?: string; name?: string } | null>(null);

  // Fetch user profile for pre-filling checkout
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiService.getUserProfile();
        const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
        setUserProfile({
          email: profile.email,
          name: fullName || undefined
        });
      } catch {
        // User might not be logged in, continue without pre-fill
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    // 100 days from today (March 10, 2026) -> approx June 18, 2026
    const targetDate = new Date('2026-06-18T00:00:00Z');
    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setLifetimeTimeLeft(null);
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setLifetimeTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pricing = [
    { years: 1, price: 3, discount: null, label: '1 Year', sub: 'Standard pricing' },
    { years: 3, price: 5, discount: '20% Off included', label: '3 Years' },
    { years: 100, price: 10, discount: '33% Off included', label: 'Lifetime', sub: 'No renewal fees. Yours forever.', recommended: true, isLifetime: true }
  ];

  const basePrice = pricing.find(p => p.years === selectedYears)?.price || pricing[0].price;
  const targetPrice = isPromoApplied ? 0 : basePrice;
  const [displayPrice, setDisplayPrice] = useState(basePrice);

  useEffect(() => {
    const duration = isPromoApplied ? 1000 : 250; // 1s rollout for promo
    const startP = displayPrice;
    const startTime = performance.now();
    let animId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo for a premium rolling down effect
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayPrice(startP + (targetPrice - startP) * easeOut);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setDisplayPrice(targetPrice);
      }
    };
    animId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPrice, isPromoApplied]);

  const currentPrice = displayPrice;

  const handleCheckAvailability = async () => {
    if (!search.trim()) return;

    setIsChecking(true);
    setHasChecked(false);
    setCheckResult(null);
    setRegistrationError(null);

    try {
      const data = await apiService.checkCnsAvailability(search);

      setCheckResult({
        available: data.available,
        reason: data.reason
      });
      setHasChecked(true);
    } catch (err) {
      setCheckResult({
        available: false,
        reason: 'Service unreachable. Please check your connection or try again later.'
      });
      setHasChecked(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRegister = () => {
    setStage('payment');
  };

  const handleConfirmPayment = async () => {
    setStage('processing');
    setRegistrationError(null);

    try {
      if (paymentMethod === 'crypto') {
        // Boomfi handles USDC/USDT selection on their checkout page
        const data = await apiService.createBoomfiCheckout(search, selectedYears, 'USDC', userProfile || undefined);
        if (data.success && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        } else {
          setRegistrationError(data.error || 'Failed to initialize crypto checkout');
          setStage('payment');
        }
      } else {
        // Fiat logic - Card payment via RevenueCat
        const data = await apiService.createRevenueCatCheckout(search, selectedYears);
        if (data.success && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        } else {
          setRegistrationError(data.error || 'Failed to initialize card checkout');
          setStage('payment');
        }
      }
    } catch (err) {
      setRegistrationError('Failed to initialize payment checkout. Please try again.');
      setStage('payment');
    }
  };

  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleApplyPromo = async () => {
    setPromoError(null);
    if (!promoCode.trim()) {
      setPromoError('Please enter a code');
      return;
    }

    setIsApplyingPromo(true);
    try {
      const data = await apiService.validateCoupon(promoCode);
      if (data.success) {
        setIsPromoApplied(true);
        setShowPromoInput(false);
      } else {
        setPromoError(data.error || 'Invalid coupon code');
      }
    } catch (err: any) {
      setPromoError(err.message || 'Error validating coupon');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleClaimCoupon = async () => {
    setStage('processing');
    setRegistrationError(null);

    try {
      const data = await apiService.claimCoupon(promoCode, search, selectedYears);
      if (data.success) {
        setTxHash(data.txHash || null);
        setRegisteredName(data.name || `${search}.cid`);
        // Refresh user data to pick up the newly registered premium name
        await refreshUser();
        setStage('success');
      } else {
        setRegistrationError(data.error || 'Failed to claim name with coupon');
        setStage('payment');
      }
    } catch (err: any) {
      setRegistrationError(err.message || 'Failed to claim name. Please try again.');
      setStage('payment');
    }
  };

  if (stage === 'processing') {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
        <div className="w-full max-w-[540px] bg-white rounded-[44px] border border-gray-100 shadow-soft p-12 md:p-16 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary via-secondary to-primary w-1/2 animate-[loading_2s_infinite_linear]"></div>
          </div>
          <div className="relative size-32 mb-10">
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 animate-[spin_8s_linear_infinite]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-primary animate-pulse">account_balance_wallet</span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-text-main mb-4 tracking-tight">Processing Payment</h2>
          <p className="text-text-sub text-base font-medium leading-relaxed max-w-sm mb-10">
            Securely confirming your registration on the Casper Network. This will anchor <span className="font-bold text-text-main">{search}.cid</span> to your identity.
          </p>
          <div className="w-full space-y-3">
            <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="size-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs font-bold text-text-sub uppercase tracking-widest">Broadcasting Transaction</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'success') {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500">
        <div className="w-full max-w-[540px] bg-white rounded-[44px] border border-gray-100 shadow-[0_40px_80px_-20px_rgba(134,82,226,0.15)] p-12 md:p-16 flex flex-col items-center text-center">
          <div className="size-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-8 relative">
            <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping"></div>
            <div className="size-14 rounded-full bg-green-500 flex items-center justify-center text-white relative z-10 shadow-lg">
              <span className="material-symbols-outlined text-[36px] font-bold">check</span>
            </div>
          </div>
          <h2 className="text-[32px] font-black text-text-main mb-4 tracking-tight leading-none">Domain Registered!</h2>
          <p className="text-text-sub text-lg font-medium leading-relaxed max-w-sm mb-10">
            <span className="text-primary font-black">{registeredName || `${search}.cid`}</span> is now officially yours and linked to your primary identity.
          </p>
          <div className="w-full bg-[#F8F9FB] rounded-[32px] p-8 mb-10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-text-sub uppercase tracking-widest">Expiration</span>
              <span className="text-sm font-black text-text-main">
                {selectedYears === 100 ? 'Lifetime' : 'Oct 24, 2025'}
              </span>
            </div>
            <div className="h-px bg-gray-200/50"></div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-text-sub uppercase tracking-widest">Registry TX</span>
              <span className="text-xs font-mono font-medium text-text-sub">
                {txHash ? `${txHash.slice(0, 8)}...${txHash.slice(-6)}` : 'Confirmed'}
              </span>
            </div>
          </div>
          <div className="flex gap-4 w-full mb-6">
            <button
              onClick={() => {
                const text = encodeURIComponent(`Just grabbed ${registeredName} on @CasperID! 🚀 My Web3 identity is officially live. Claim yours: casperid.com`);
                window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
              }}
              className="flex-1 h-14 bg-[#1DA1F2] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#1A91DA] transition-all"
            >
              <svg className="size-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Brag on X
            </button>
            <button
              onClick={() => window.open(`https://${registeredName.split('.')[0]}.casperid.com`, '_blank')}
              className="flex-1 h-14 bg-white border border-gray-100 text-text-main rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">visibility</span>
              View Profile
            </button>
          </div>

          <button
            onClick={onBack}
            className="w-full h-16 bg-primary/10 text-primary rounded-[24px] font-black text-lg hover:bg-primary/15 transition-all active:scale-[0.98]"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }


  if (stage === 'payment') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500 pb-20">
        <button
          onClick={() => setStage('search')}
          className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors font-bold text-sm group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Options
        </button>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-soft overflow-hidden">
          <div className="p-10 border-b border-gray-50 bg-gray-50/20">
            <h2 className="text-2xl font-black text-text-main tracking-tight">Order Summary</h2>
            <p className="text-text-sub text-sm font-medium mt-1">Confirm your registration details</p>
          </div>

          <div className="p-10 space-y-8">
            <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">.CID</div>
                <div>
                  <h3 className="text-lg font-black text-text-main">{search}.cid</h3>
                  <p className="text-xs font-bold text-text-sub uppercase tracking-widest">Registration Period: {selectedYears === 100 ? 'Lifetime' : `${selectedYears} Years`}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-text-main">${currentPrice.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-text-sub uppercase tracking-tight">{(currentPrice * 20).toFixed(0)} CSPR</p>
              </div>
            </div>

            {!isPromoApplied && (
              <div className="space-y-6">
                <p className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Select Payment Method</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('crypto')}
                    className={`p-6 rounded-[28px] border-2 transition-all flex flex-col gap-4 text-left ${paymentMethod === 'crypto' ? 'border-primary bg-primary/[0.02]' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                      <span className="material-symbols-outlined font-bold">paid</span>
                    </div>
                    <div>
                      <h4 className="text-base font-black text-text-main">Pay with Crypto</h4>
                      <p className="text-xs font-medium text-text-sub leading-relaxed">Secure crypto checkout USDC/USDT</p>
                    </div>
                  </button>

                  {/* Card Option */}
                  <button
                    onClick={() => setPaymentMethod('fiat')}
                    className={`p-6 rounded-[28px] border-2 h-fit transition-all flex flex-col gap-4 text-left ${paymentMethod === 'fiat' ? 'border-primary bg-primary/[0.02]' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <span className="material-symbols-outlined">credit_card</span>
                    </div>
                    <div>
                      <h4 className="text-base font-black text-text-main">Pay with Card</h4>
                      <p className="text-xs font-medium text-text-sub leading-relaxed">Fast and secure fiat checkout</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-10 border-t border-gray-50 flex flex-col gap-6">
            <div className="flex justify-between items-center px-2">
              <span className="text-lg font-bold text-text-sub">Total Due:</span>
              <span className="text-3xl font-black text-text-main">${currentPrice.toFixed(2)}</span>
            </div>
            {registrationError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500">error</span>
                <p className="text-sm font-medium text-red-700">{registrationError}</p>
              </div>
            )}
            <button
              onClick={isPromoApplied ? handleClaimCoupon : handleConfirmPayment}
              disabled={(!!lifetimeTimeLeft && !isPromoApplied)}
              className={`w-full h-16 rounded-[24px] font-black text-lg transition-all flex items-center justify-center gap-3 ${(lifetimeTimeLeft && !isPromoApplied) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary/95 active:scale-[0.98]'}`}
            >
              {!isPromoApplied && (
                <span className="material-symbols-outlined">{paymentMethod === 'crypto' ? 'paid' : 'credit_card'}</span>
              )}
              {isPromoApplied ? 'Claim Name Now' : 'Confirm & Pay'}
            </button>

            {/* Promo Code Section - Placed Below Button */}
            <div className="w-full flex flex-col items-center pt-2">
              {!showPromoInput && !isPromoApplied ? (
                <button
                  onClick={() => setShowPromoInput(true)}
                  className="text-sm font-bold text-text-sub hover:text-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">local_offer</span>
                  Got a coupon?
                </button>
              ) : showPromoInput && !isPromoApplied ? (
                <div className="w-full max-w-sm mt-2 relative">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE..."
                      className={`w-full h-[52px] pl-5 pr-[100px] rounded-[16px] border-2 bg-white text-base font-bold text-text-main focus:outline-none uppercase placeholder:text-gray-400 placeholder:font-bold ${promoError ? 'border-red-400 focus:border-red-500 hover:border-red-500' : 'border-[#bca7f7] focus:border-[#a385f5] hover:border-[#bca7f7]'}`}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo}
                      className={`absolute right-1.5 h-[40px] px-6 rounded-[12px] bg-[#1a1f2e] text-white text-sm font-bold hover:bg-black transition-colors ${isApplyingPromo ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isApplyingPromo ? '...' : 'Apply'}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-sm font-bold text-red-500 mt-2 text-left w-full pl-2">{promoError}</p>
                  )}
                </div>
              ) : isPromoApplied ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-green-50/80 border border-green-200">
                  <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                  <span className="text-sm font-black text-green-700 uppercase tracking-tight">100% OFF ({promoCode} applied)</span>
                  <button
                    onClick={() => {
                      setIsPromoApplied(false);
                      setPromoCode('');
                    }}
                    className="ml-3 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Hero Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-5xl font-black text-text-main tracking-tight leading-tight">
          Claim Your Personal <span className="text-primary">.CID</span> Domain
        </h1>
        <p className="text-text-sub text-lg font-medium max-w-2xl mx-auto leading-relaxed opacity-70">
          Upgrade from your system ID to a human-readable identity. Secure your name on the Casper Network.
        </p>
        {/* Why upgrade link */}
        <button
          onClick={() => setShowExplanationModal(true)}
          className="inline-flex items-center gap-2 text-primary font-bold text-lg hover:opacity-80 transition-opacity mt-2"
        >
          Why upgrade to a .CID domain?
          <span className="material-symbols-outlined text-xl">help</span>
        </button>
      </div>

      {/* Search Bar Area */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-10 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
              <span className="text-2xl font-black text-gray-300">.cid</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                setHasChecked(false);
              }}
              className="w-full h-20 px-8 rounded-3xl bg-[#F9FAFB] border-2 border-transparent focus:border-primary/20 focus:bg-white text-2xl font-bold text-text-main transition-all outline-none"
              placeholder="Search for your name"
            />
          </div>
          <button
            disabled={isChecking || !search}
            onClick={handleCheckAvailability}
            className="h-20 px-10 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/25 hover:bg-primary/95 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center min-w-[240px]"
          >
            {isChecking ? (
              <div className="size-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : 'Check Availability'}
          </button>
        </div>
        <p className="text-sm font-medium text-text-sub ml-4">
          Search for your preferred name (e.g., alice.cid)
        </p>
      </div>

      {/* Results & Options Area */}
      {hasChecked && checkResult && (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden animate-in slide-in-from-top-4 duration-500">
          {/* Availability Status */}
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-text-main tracking-tight">{search}.cid</h2>
              {checkResult?.available ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg border border-green-100">
                  <span className="material-symbols-outlined text-[18px] font-bold">check_circle</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">AVAILABLE!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg border border-red-100">
                  <span className="material-symbols-outlined text-[18px] font-bold">cancel</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">TAKEN</span>
                </div>
              )}
            </div>
            {checkResult?.available && (
              <p className="text-[10px] font-black text-text-sub uppercase tracking-[0.2em] opacity-40">SELECT REGISTRATION PERIOD</p>
            )}
          </div>

          {/* Unavailable Message */}
          {!checkResult?.available && (
            <div className="p-10 text-center">
              <div className="size-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-6">
                <span className="material-symbols-outlined text-[32px]">block</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">This name is already taken</h3>
              <p className="text-text-sub mb-6">{checkResult?.reason || 'Try searching for a different name.'}</p>
              <button
                onClick={() => {
                  setSearch('');
                  setHasChecked(false);
                  setCheckResult(null);
                }}
                className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all"
              >
                Try Another Name
              </button>
            </div>
          )}

          {/* Pricing Cards - Only show if available */}
          {checkResult?.available && (
            <>
              <div className="p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {pricing.map((option) => (
                    <div
                      key={option.years}
                      onClick={() => !isPromoApplied && setSelectedYears(option.years)}
                      className={`relative p-8 rounded-[28px] border-2 transition-all group flex flex-col justify-between h-[210px] ${isPromoApplied && option.years !== 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${selectedYears === option.years
                        ? 'border-primary bg-primary/[0.01]'
                        : 'border-gray-50 bg-[#FCFDFF] hover:border-gray-200'
                        }`}
                    >
                      {option.recommended && (
                        <div className="absolute top-0 right-8 -translate-y-1/2 flex flex-col items-end">
                          <span className="px-3 py-1.5 bg-secondary text-primary rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">EARLY ADOPTER PERK</span>
                        </div>
                      )}

                      <div>
                        <h3 className={`text-sm font-bold mb-4 ${selectedYears === option.years ? 'text-primary' : 'text-text-sub'}`}>{option.label}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[44px] font-black text-text-main leading-none">${option.price}</span>
                          <span className="text-sm font-bold text-text-sub uppercase tracking-widest">USD</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {(option as any).isLifetime && lifetimeTimeLeft && (
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-[#FF8A00] mb-2 bg-[#FF8A00]/10 px-2 py-1.5 rounded-lg w-fit">
                            <span className="material-symbols-outlined text-[14px]">timer</span>
                            Ends in {lifetimeTimeLeft.days}d {lifetimeTimeLeft.hours}h
                          </div>
                        )}
                        {option.discount && <p className="text-[11px] font-black text-green-600">{option.discount}</p>}
                        {option.sub && <p className={`text-[11px] font-bold text-text-sub ${(option as any).isLifetime ? '' : 'opacity-40'}`}>{option.sub}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Features Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-text-main leading-tight">One-time payment</h4>
                      <p className="text-[11px] font-medium text-text-sub leading-relaxed mt-0.5">No recurring annual fees</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">swap_horiz</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-text-main leading-tight">Transferable</h4>
                      <p className="text-[11px] font-medium text-text-sub leading-relaxed mt-0.5">Move to any wallet anytime</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF8A00]">
                      <span className="material-symbols-outlined">fingerprint</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-text-main leading-tight">Soulbound Metadata</h4>
                      <p className="text-[11px] font-medium text-text-sub leading-relaxed mt-0.5">Linked verifiable credentials</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-10 border-t border-gray-50 flex flex-col md:flex-row items-end md:items-center justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-text-sub">Total Price:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[44px] font-black text-text-main leading-none">${currentPrice.toFixed(2)}</span>
                      <span className="text-xl font-bold text-text-sub uppercase tracking-widest">USD</span>
                    </div>
                  </div>

                  <div className="bg-orange-50/80 border border-orange-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="material-symbols-outlined text-orange-500 text-[20px] font-bold">info</span>
                    <p className="text-[11px] font-black text-orange-900 tracking-tight leading-none">
                      Note: This will become your root identity and replace <span className="underline italic font-bold">nete-tute-bona</span>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  className="w-full py-4 rounded-[20px] font-black text-lg transition-all bg-primary text-white shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98]"
                >
                  Register & Pay
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* CID Explanation Modal */}
      <CIDExplanationModal
        isOpen={showExplanationModal}
        onClose={() => setShowExplanationModal(false)}
      />
    </div>
  );
};
