import React, { useEffect, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { apiService } from '../services/api';
import { ProfileReview } from '../types';

interface ProfileReviewsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  identifier: string;
  reviewUrl: string;
}

interface ReviewsSummary {
  total_reviews: number;
  average_rating: number | null;
}

const renderStars = (rating: number) => (
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${index < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
    />
  ))
);

export const ProfileReviewsDrawer: React.FC<ProfileReviewsDrawerProps> = ({
  isOpen,
  onClose,
  identifier,
  reviewUrl,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<ReviewsSummary | null>(null);
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [profileName, setProfileName] = useState(identifier);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !identifier) return;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiService.getProfileReviews(identifier);
        setSummary(response.summary || null);
        setReviews((response.reviews || []).slice(0, 4));
        setProfileName(
          response.profile?.full_name ||
          response.profile?.human_id ||
          response.profile?.cns_name ||
          identifier
        );
      } catch (err: any) {
        setError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [identifier, isOpen]);

  return (
    <div className={`fixed inset-0 z-[9000] flex justify-end ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div
        className={`relative h-full w-full max-w-xl bg-[#F4F7FA] flex flex-col shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 shrink-0">
          <div>
            <p className="text-sm font-black text-gray-900 leading-none">Profile Reviews</p>
            <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-[0.18em]">{profileName}</p>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95"
            aria-label="Close reviews panel"
          >
            <span className="material-symbols-outlined text-[20px] text-gray-500">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-bold text-gray-400">Loading reviews...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-[24px] p-8 text-center shadow-sm border border-gray-100">
              <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-500 text-4xl">warning</span>
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-1">Could not load reviews</h3>
              <p className="text-sm text-gray-500 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="rounded-[28px] bg-gradient-to-br from-[#1A1A2E] to-[#23233B] p-6 text-white shadow-xl">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Trusted feedback</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(Math.round(summary?.average_rating || 0))}
                      </div>
                      <span className="text-3xl font-black">{summary?.average_rating ?? '0.0'}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white/70">
                      {summary?.total_reviews || 0} public review{summary?.total_reviews === 1 ? '' : 's'}
                    </p>
                  </div>
                  <a
                    href={reviewUrl}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-[11px] font-black uppercase tracking-[0.18em] text-[#1A1A2E]"
                  >
                    View all reviews
                  </a>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="rounded-[28px] border border-gray-100 bg-white p-8 text-center shadow-sm">
                  <h3 className="text-lg font-black text-text-main">No public reviews yet</h3>
                  <p className="mt-2 text-sm font-medium text-text-sub">
                    This profile has not published any reviews yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <article key={review.id} className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary/70">
                            <span>{review.type}</span>
                            <span className="text-gray-300">•</span>
                            <span>{review.relationship}</span>
                          </div>
                          <h3 className="mt-3 text-lg font-black text-text-main">{review.reviewer_name || 'Anonymous reviewer'}</h3>
                          {(review.reviewer_title || review.reviewer_company) && (
                            <p className="mt-1 text-sm font-bold text-text-sub">
                              {[review.reviewer_title, review.reviewer_company].filter(Boolean).join(' at ')}
                            </p>
                          )}
                        </div>
                        <div className="rounded-2xl bg-amber-50 px-3 py-2">
                          <div className="flex items-center gap-1">{renderStars(review.rating || 0)}</div>
                        </div>
                      </div>
                      {review.review_text ? (
                        <p className="mt-5 text-sm font-medium leading-7 text-text-main">{review.review_text}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileReviewsDrawer;
