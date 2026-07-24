import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Mail, Star } from 'lucide-react';
import { apiService } from '../../services/api';
import { ProfileReview, UserProfile } from '../../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ProfileReviewsManagerProps {
  profile: UserProfile | null;
}

type ReviewFilter = 'all' | 'pending' | 'approved' | 'expired' | 'archived' | 'revoked';

const typeOptions: Array<ProfileReview['type']> = ['endorsement', 'recommendation', 'testimonial'];
const filterOptions: Array<{ value: ReviewFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Live' },
  { value: 'expired', label: 'Expired' },
  { value: 'archived', label: 'Archived' },
  { value: 'revoked', label: 'Revoked' },
];

const formatReviewType = (value: ProfileReview['type']) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const ProfileReviewsManager: React.FC<ProfileReviewsManagerProps> = ({ profile }) => {
  const identifier = profile?.human_id || profile?.cns_name || profile?.wallet || '';
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [type, setType] = useState<ProfileReview['type']>('recommendation');
  const [relationship, setRelationship] = useState('');
  const [promptNote, setPromptNote] = useState('');
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [actioningReviewId, setActioningReviewId] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getMyProfileReviews();
      setReviews(response.reviews || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const publicReviewUrl = useMemo(() => {
    if (!identifier) return '';
    return `${window.location.protocol}//${window.location.host}/profile/${identifier}/reviews`;
  }, [identifier]);

  const handleRequest = async () => {
    try {
      setSubmitting(true);
      setError('');
      setNotice('');
      await apiService.requestProfileReview(identifier, {
        reviewerEmail,
        type,
        relationship,
        promptNote
      });
      setReviewerEmail('');
      setRelationship('');
      setPromptNote('');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (reviewId: string) => {
    try {
      setError('');
      setNotice('');
      setActioningReviewId(reviewId);
      await apiService.archiveProfileReview(reviewId);
      setNotice('Review archived.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to archive review');
    } finally {
      setActioningReviewId('');
    }
  };

  const handleResend = async (reviewId: string) => {
    try {
      setError('');
      setNotice('');
      setActioningReviewId(reviewId);
      await apiService.resendProfileReview(reviewId);
      setNotice('Invitation resent.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to resend invitation');
    } finally {
      setActioningReviewId('');
    }
  };

  const handleRevoke = async (reviewId: string) => {
    try {
      setError('');
      setNotice('');
      setActioningReviewId(reviewId);
      await apiService.revokeProfileReview(reviewId);
      setNotice('Invitation revoked.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke invitation');
    } finally {
      setActioningReviewId('');
    }
  };

  const handleCopyLink = async (reviewId: string) => {
    try {
      setError('');
      setNotice('');
      setActioningReviewId(reviewId);
      const response = await apiService.generateProfileReviewLink(reviewId);
      await navigator.clipboard.writeText(response.invite_url);
      setNotice('Fresh invite link copied.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to copy invite link');
    } finally {
      setActioningReviewId('');
    }
  };

  const filteredReviews = useMemo(() => {
    if (filter === 'all') return reviews;
    if (filter === 'pending') {
      return reviews.filter((review) => ['request_sent', 'opened'].includes(review.status));
    }
    return reviews.filter((review) => review.status === filter);
  }, [filter, reviews]);

  const formatStatus = (status: ProfileReview['status']) =>
    status.replace('_', ' ');

  const canManageInvite = (review: ProfileReview) =>
    ['request_sent', 'opened', 'expired', 'revoked'].includes(review.status);

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-gray-100 bg-white shadow-soft overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/10 px-8 py-5">
          <div>
            <h3 className="text-xl font-black text-text-main">Request Reviews</h3>
            <p className="mt-1 text-sm font-medium text-text-sub">Invite one reviewer email per profile. Reviews publish immediately after submission.</p>
          </div>
          {publicReviewUrl ? (
            <a href={publicReviewUrl} target="_blank" rel="noopener" className="rounded-2xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white">
              Open Public Reviews
            </a>
          ) : null}
        </div>

        <div className="p-8 space-y-6">
          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">{error}</div> : null}
          {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">{notice}</div> : null}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-main">Reviewer email</label>
              <input value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)} className="h-14 w-full rounded-2xl bg-gray-50 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" placeholder="name@company.com" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-main">Review type</label>
              <Select value={type} onValueChange={(value) => setType(value as ProfileReview['type'])}>
                <SelectTrigger className="h-14 w-full rounded-2xl border-none bg-gray-50 px-5 text-sm font-bold text-text-main shadow-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-0">
                  <SelectValue placeholder="Select review type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-gray-100 bg-white shadow-soft">
                  {typeOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="rounded-xl py-3 pl-9 pr-3 text-sm font-bold text-text-main focus:bg-primary/5 focus:text-text-main"
                    >
                      {formatReviewType(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-main">Relationship</label>
            <input value={relationship} onChange={(e) => setRelationship(e.target.value)} className="h-14 w-full rounded-2xl bg-gray-50 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" placeholder="Former manager, teammate, client..." />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-main">Optional note</label>
            <textarea value={promptNote} onChange={(e) => setPromptNote(e.target.value)} className="h-32 w-full resize-none rounded-[28px] bg-gray-50 p-5 text-sm font-medium leading-7 outline-none focus:ring-2 focus:ring-primary/20" placeholder="Give the reviewer useful context for what to focus on." />
          </div>

          <button
            type="button"
            onClick={handleRequest}
            disabled={!identifier || !reviewerEmail || !relationship || submitting}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-sm font-black text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
            Send review request
          </button>
        </div>
      </div>

      <div className="rounded-[32px] border border-gray-100 bg-white shadow-soft overflow-hidden">
        <div className="border-b border-gray-50 px-8 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-xl font-black text-text-main">Review Queue</h3>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={`rounded-2xl px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition-colors ${
                    filter === option.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 text-text-sub hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="rounded-[28px] bg-[#F8F9FF] px-6 py-10 text-center">
              <p className="text-lg font-black text-text-main">No reviews in this view</p>
              <p className="mt-2 text-sm font-medium text-text-sub">Try a different filter or send a new review request.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="rounded-[28px] border border-gray-100 bg-[#FCFCFF] p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary/70">
                        <span>{review.type}</span>
                        <span className="text-gray-300">•</span>
                        <span>{formatStatus(review.status)}</span>
                      </div>
                      <h4 className="mt-3 text-lg font-black text-text-main">{review.reviewer_email}</h4>
                      <p className="mt-1 text-sm font-bold text-text-sub">{review.relationship}</p>
                      {review.expires_at ? (
                        <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-text-sub">
                          Expires {new Date(review.expires_at).toLocaleDateString()}
                        </p>
                      ) : null}
                      {review.access_lock_until ? (
                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                          Reviewer locked until {new Date(review.access_lock_until).toLocaleString()}
                        </p>
                      ) : null}
                      {review.review_text ? (
                        <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-text-main">{review.review_text}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-start gap-3 md:items-end">
                      {review.rating ? (
                        <div className="flex items-center gap-1 rounded-2xl bg-amber-50 px-4 py-3">
                          {Array.from({ length: 5 }, (_, index) => (
                            <Star key={index} className={`h-4 w-4 ${index < (review.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      ) : null}
                      {canManageInvite(review) ? (
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <button
                            type="button"
                            onClick={() => handleResend(review.id)}
                            disabled={actioningReviewId === review.id}
                            className="rounded-2xl bg-primary px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white disabled:opacity-50"
                          >
                            {actioningReviewId === review.id ? 'Working...' : review.status === 'expired' ? 'Re-open invite' : 'Resend'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(review.id)}
                            disabled={actioningReviewId === review.id}
                            className="rounded-2xl border border-gray-200 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-text-main disabled:opacity-50"
                          >
                            Copy link
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevoke(review.id)}
                            disabled={actioningReviewId === review.id || review.status === 'revoked'}
                            className="rounded-2xl border border-red-200 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-red-700 disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        </div>
                      ) : null}
                      {review.status !== 'archived' && review.status === 'approved' ? (
                        <button
                          type="button"
                          onClick={() => handleArchive(review.id)}
                          disabled={actioningReviewId === review.id}
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-text-main"
                        >
                          {actioningReviewId === review.id ? 'Working...' : 'Archive'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileReviewsManager;
