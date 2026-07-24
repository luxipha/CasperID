import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Star } from 'lucide-react';
import { apiService } from '../../services/api';
import { ProfileReview } from '../../types';
import HeaderMarketing from '../HeaderMarketing';

interface PublicReviewsPageProps {
  identifier: string;
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${index < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
    />
  ));
};

export const PublicReviewsPage: React.FC<PublicReviewsPageProps> = ({ identifier }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState<{ total_reviews: number; average_rating: number | null } | null>(null);
  const [reviews, setReviews] = useState<ProfileReview[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiService.getProfileReviews(identifier);
        if (!mounted) return;
        setProfile(response.profile);
        setSummary(response.summary);
        setReviews(response.reviews || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Failed to load reviews');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [identifier]);

  const profileName = useMemo(() => {
    if (!profile) return identifier;
    return profile.full_name || profile.human_id || profile.cns_name || identifier;
  }, [profile, identifier]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      <HeaderMarketing hideMenu={true} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-soft">
          <Link to={`/profile/${identifier}`} className="inline-flex items-center gap-2 text-sm font-bold text-text-sub hover:text-primary">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to profile
          </Link>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/70">CasperID Reviews</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-text-main md:text-5xl">{profileName}</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-text-sub">
                Verified, invite-only endorsements, recommendations, and testimonials attached to this profile.
              </p>
            </div>
            <div className="rounded-[28px] bg-[#F8F9FF] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(summary?.average_rating || 0))}
                </div>
                <span className="text-3xl font-black text-text-main">{summary?.average_rating ?? '0.0'}</span>
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-text-sub">
                {summary?.total_reviews || 0} public reviews
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 space-y-5">
          {reviews.length === 0 ? (
            <div className="rounded-[32px] border border-gray-100 bg-white p-10 text-center shadow-soft">
              <h2 className="text-2xl font-black text-text-main">No public reviews yet</h2>
              <p className="mt-3 text-sm font-medium text-text-sub">
                This profile has not published any reviews yet.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-soft">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary/70">
                      <span>{review.type}</span>
                      <span className="text-gray-300">•</span>
                      <span>{review.relationship}</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-text-main">{review.reviewer_name}</h2>
                    <p className="mt-1 text-sm font-bold text-text-sub">
                      {review.reviewer_title} at {review.reviewer_company}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-4 py-3">
                    <div className="flex items-center gap-1">{renderStars(review.rating || 0)}</div>
                    <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">
                      {review.rating}/5
                    </p>
                  </div>
                </div>

                <p className="mt-6 whitespace-pre-wrap text-base font-medium leading-8 text-text-main">
                  {review.review_text}
                </p>

                {review.approved_at ? (
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-text-sub">
                    Published {new Date(review.approved_at).toLocaleDateString()}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicReviewsPage;
