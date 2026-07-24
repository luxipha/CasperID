import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Star } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { OTPVerify } from '../OTPVerify';

interface ReviewInvitationPageProps {
  token: string;
}

type Stage = 'loading' | 'entry' | 'otp' | 'form' | 'submitted';

const StarPicker: React.FC<{ rating: number; onChange: (rating: number) => void }> = ({ rating, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const active = value <= rating;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className="rounded-full p-1 transition-transform hover:scale-110"
          >
            <Star className={`h-7 w-7 ${active ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
          </button>
        );
      })}
    </div>
  );
};

export const ReviewInvitationPage: React.FC<ReviewInvitationPageProps> = ({ token }) => {
  const { login, register } = useAuth();
  const [stage, setStage] = useState<Stage>('loading');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingPasskey, setCreatingPasskey] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [verificationId, setVerificationId] = useState('');
  const [email, setEmail] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerTitle, setReviewerTitle] = useState('');
  const [reviewerCompany, setReviewerCompany] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [showPasskeyNudge, setShowPasskeyNudge] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');
  const [sessionExpiresAt, setSessionExpiresAt] = useState<string>('');

  const loadInvitation = async () => {
    const response = await apiService.getReviewInvitation(token);
    setInvitation(response);
    setSessionExpiresAt(response?.access?.session_expires_at || '');
    setEmail(response?.invitation?.reviewer_email_hint?.includes('***') ? '' : response?.invitation?.reviewer_email || '');

    if (response.already_submitted) {
      setStage('submitted');
      return;
    }

    if (response.access?.granted) {
      setStage('form');
    } else {
      setStage('entry');
    }
  };

  useEffect(() => {
    loadInvitation().catch((err: any) => {
      setError(err.message || 'Failed to load invitation');
      setStage('entry');
    });
  }, [token]);

  const profileTitle = useMemo(() => {
    const target = invitation?.target_profile;
    return target?.full_name || 'CasperID profile';
  }, [invitation]);

  const handleStart = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.startReviewInvitationAccess(token, email);
      if (response.hasPasskey) {
        await login(email);
        await loadInvitation();
        return;
      }

      setVerificationId(response.verificationId);
      setStage('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to start access verification');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (currentVerificationId: string, otp: string) => {
    return apiService.verifyReviewInvitationAccess(token, currentVerificationId, otp);
  };

  const handleResendOtp = async (currentVerificationId: string) => {
    return apiService.resendReviewInvitationAccess(token, currentVerificationId);
  };

  const handleOtpSuccess = async (response: any) => {
    setSessionExpiresAt(response?.expiresAt || '');
    if (!response.userExists) {
      setShowPasskeyNudge(true);
    }
    await loadInvitation();
  };

  const handleSubmitReview = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.submitReviewInvitation(token, {
        reviewerName,
        reviewerTitle,
        reviewerCompany,
        rating,
        reviewText
      });
      setPublicUrl(response.public_url);
      setStage('submitted');
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePasskey = async () => {
    try {
      setCreatingPasskey(true);
      setError('');
      await register(email, reviewerName || 'CasperID Reviewer');
      setShowPasskeyNudge(false);
      await loadInvitation();
    } catch (err: any) {
      setError(err.message || 'Failed to create passkey');
    } finally {
      setCreatingPasskey(false);
    }
  };

  if (stage === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAFBFF] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (stage === 'otp') {
    return (
      <OTPVerify
        email={email}
        verificationId={verificationId}
        title="Verify reviewer access"
        description={`Enter the 6-digit code sent to ${email}`}
        backLabel="Back to invite"
        successLabel="Verify & Continue"
        onBack={() => setStage('entry')}
        onVerifyCode={handleVerifyOtp}
        onResendCode={handleResendOtp}
        onSuccess={handleOtpSuccess}
        initialResendDelaySeconds={60}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-gray-100 bg-white p-8 shadow-soft md:p-10">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-text-sub hover:text-primary">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              CasperID
            </Link>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary/70">
              {invitation?.invitation?.type}
            </p>
          </div>

          <div className="mt-8">
            <h1 className="text-3xl font-black tracking-tight text-text-main md:text-5xl">
              Review request for {profileTitle}
            </h1>
            <p className="mt-4 text-sm font-medium leading-7 text-text-sub">
              {invitation?.invitation?.prompt_note || `You were invited to leave a ${invitation?.invitation?.type} tied to this CasperID profile.`}
            </p>
            {invitation?.target_profile?.headline ? (
              <p className="mt-4 text-sm font-bold text-primary">{invitation.target_profile.headline}</p>
            ) : null}
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
              {error}
            </div>
          ) : null}

          {stage === 'entry' && (
            <div className="mt-10 grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[28px] bg-[#F8F9FF] p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-sub">Access rules</p>
                <ul className="mt-4 space-y-3 text-sm font-medium leading-7 text-text-main">
                  <li>Invite-only reviewer access</li>
                  <li>Required email verification</li>
                  <li>Required star rating</li>
                  <li>Review becomes public immediately after submission</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-main">Invited reviewer email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 w-full rounded-2xl bg-gray-50 px-5 text-sm font-bold text-text-main outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="name@company.com"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={!email || loading}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-sm font-black text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Continue to verify'}
                </button>
              </div>
            </div>
          )}

          {stage === 'form' && (
            <div className="mt-10 space-y-8">
              {showPasskeyNudge ? (
                <div className="rounded-[28px] border border-primary/20 bg-primary/5 px-6 py-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm font-bold text-text-main">
                      Your reviewer access is ready. Add a passkey now to create your CasperID reviewer account without leaving this screen.
                    </p>
                    <button
                      type="button"
                      onClick={handleCreatePasskey}
                      disabled={creatingPasskey}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-xs font-black uppercase tracking-[0.18em] text-white disabled:opacity-50"
                    >
                      {creatingPasskey ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add passkey'}
                    </button>
                  </div>
                </div>
              ) : null}

              {sessionExpiresAt ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
                  Reviewer access expires on {new Date(sessionExpiresAt).toLocaleString()}.
                </div>
              ) : null}

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-main">Your name</label>
                  <input value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} className="h-14 w-full rounded-2xl bg-gray-50 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-main">Title</label>
                  <input value={reviewerTitle} onChange={(e) => setReviewerTitle(e.target.value)} className="h-14 w-full rounded-2xl bg-gray-50 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-main">Company</label>
                  <input value={reviewerCompany} onChange={(e) => setReviewerCompany(e.target.value)} className="h-14 w-full rounded-2xl bg-gray-50 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-text-main">Star rating</label>
                <StarPicker rating={rating} onChange={setRating} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-main">Your review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value.slice(0, 250))}
                  className="h-40 w-full resize-none rounded-[28px] bg-gray-50 p-5 text-sm font-medium leading-7 outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Write your recommendation, endorsement, or testimonial in 250 characters or fewer."
                />
                <p className="text-right text-[11px] font-bold text-text-sub">{reviewText.length}/250</p>
              </div>

              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={!reviewerName || !reviewerTitle || !reviewerCompany || !reviewText.trim() || loading}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-sm font-black text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit review'}
              </button>
            </div>
          )}

          {stage === 'submitted' && (
            <div className="mt-10 rounded-[32px] bg-[#F8F9FF] p-8 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary/70">Review submitted</p>
              <h2 className="mt-4 text-3xl font-black text-text-main">Your review is now live</h2>
              <p className="mt-4 text-sm font-medium leading-7 text-text-sub">
                CasperID published your review to the profile immediately. The profile owner can archive it later if needed.
              </p>
              {publicUrl ? (
                <a
                  href={publicUrl}
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-black text-white shadow-xl shadow-primary/20"
                >
                  View public reviews
                </a>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReviewInvitationPage;
