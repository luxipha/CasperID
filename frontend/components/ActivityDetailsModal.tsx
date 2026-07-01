import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';
import { IdentityToolModal } from './ui/IdentityToolModal';
import {
  buildContextSections,
  buildMetadataRows,
  buildSummaryRows,
  buildTechnicalRows,
  getStatusTone,
  inferActivityMeta,
} from '../utils/activityDetail';

interface ActivityDetailsModalProps {
  isOpen: boolean;
  activityId: string | null;
  onClose: () => void;
}

export const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  isOpen,
  activityId,
  onClose,
}) => {
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !activityId) return;

    let cancelled = false;

    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getActivityDetail(activityId);
        if (!cancelled) {
          setActivity(response);
        }
      } catch (fetchError: any) {
        if (!cancelled) {
          setError(fetchError.message || 'Failed to load activity details');
          setActivity(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchActivity();
    return () => {
      cancelled = true;
    };
  }, [activityId, isOpen]);

  const meta = useMemo(() => inferActivityMeta(activity), [activity]);
  const summaryRows = useMemo(() => buildSummaryRows(activity, activityId), [activity, activityId]);
  const technicalRows = useMemo(() => buildTechnicalRows(activity), [activity]);
  const metadataRows = useMemo(() => buildMetadataRows(activity), [activity]);
  const contextSections = useMemo(() => buildContextSections(activity), [activity]);
  const structuredData = useMemo(() => {
    if (!activity?.data && !activity?.metadata) return null;
    return JSON.stringify(activity.data || activity.metadata, null, 2);
  }, [activity]);

  return (
    <IdentityToolModal
      isOpen={isOpen}
      onClose={onClose}
      title={meta.title}
      subtitle={meta.subtitle}
      icon={meta.icon}
      iconBg={meta.iconBg}
      description={meta.description || 'Review the stored activity record for this event.'}
      actionLabel="Close Details"
      actionIcon="close"
      onAction={onClose}
      isActionDisabled={loading}
      maxWidth="max-w-3xl"
      footer={error ? <span className="text-xs font-bold text-red-600">{error}</span> : null}
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-red-100 bg-red-50 p-6">
          <p className="text-sm font-black text-red-800">Failed to load activity details</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {meta.status ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusTone(meta.status)}`}>
                {meta.status}
              </span>
            </div>
          ) : null}

          {summaryRows.length > 0 ? (
            <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-sub opacity-60">Summary</p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {summaryRows.map((row) => (
                  <div key={row.label} className="rounded-[24px] border border-gray-100 bg-[#F8F9FB] p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-sub opacity-60">{row.label}</p>
                    <p className="mt-2 text-sm font-bold text-text-main break-words">{row.value}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {contextSections.length > 0 ? (
            <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-sub opacity-60">Context</p>
              <div className="mt-4 space-y-4">
                {contextSections.map((entry) => (
                  <div key={entry.label}>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-sub opacity-60">{entry.label}</p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-text-main break-words">{entry.value}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {technicalRows.length > 0 ? (
            <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-sub opacity-60">Technical Details</p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {technicalRows.map((row) => (
                  <div key={row.label} className="rounded-[24px] border border-gray-100 bg-[#F8F9FB] p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-sub opacity-60">{row.label}</p>
                    <p className="mt-2 text-sm font-bold text-text-main break-words">{row.value}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {metadataRows.length > 0 ? (
            <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-sub opacity-60">Metadata</p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {metadataRows.map((row) => (
                  <div key={row.label} className="rounded-[24px] border border-gray-100 bg-[#F8F9FB] p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-sub opacity-60">{row.label}</p>
                    <p className="mt-2 text-sm font-bold text-text-main break-all">{row.value}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {structuredData ? (
            <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-sub opacity-60">Structured Data</p>
              <pre className="mt-4 overflow-x-auto rounded-[24px] bg-[#F8F9FB] p-5 text-xs font-medium text-text-main">{structuredData}</pre>
            </section>
          ) : null}

          {!summaryRows.length && !technicalRows.length && !metadataRows.length && !contextSections.length && !structuredData ? (
            <div className="rounded-[28px] border border-gray-100 bg-[#F8F9FB] p-6">
              <p className="text-sm font-bold text-text-main">No additional activity metadata was stored for this record.</p>
            </div>
          ) : null}
        </div>
      )}
    </IdentityToolModal>
  );
};
