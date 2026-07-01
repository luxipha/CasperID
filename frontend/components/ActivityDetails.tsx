import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';
import {
  buildContextSections,
  buildMetadataRows,
  buildSummaryRows,
  buildTechnicalRows,
  getStatusTone,
  inferActivityMeta,
} from '../utils/activityDetail';

interface ActivityDetailsProps {
  activityId: string;
  onBack: () => void;
}

export const ActivityDetails: React.FC<ActivityDetailsProps> = ({ activityId, onBack }) => {
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getActivityDetail(activityId);
        setActivity(response);
      } catch (err: any) {
        setError(err.message || 'Failed to load activity details');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetail();
  }, [activityId]);

  const meta = useMemo(() => inferActivityMeta(activity), [activity]);
  const summaryRows = useMemo(() => buildSummaryRows(activity, activityId), [activity, activityId]);
  const technicalRows = useMemo(() => buildTechnicalRows(activity), [activity]);
  const metadataRows = useMemo(() => buildMetadataRows(activity), [activity]);
  const contextSections = useMemo(() => buildContextSections(activity), [activity]);
  const structuredData = useMemo(() => {
    if (!activity?.data && !activity?.metadata) return null;
    return JSON.stringify(activity.data || activity.metadata, null, 2);
  }, [activity]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
        <p className="text-text-main font-bold text-lg mb-2">Failed to load activity details</p>
        <p className="text-text-sub text-sm mb-4">{error || 'Activity not found'}</p>
        <button onClick={onBack} className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
          Back to Activity Log
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors font-bold text-sm group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Activity Log
        </button>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`flex size-12 items-center justify-center rounded-2xl ${meta.iconBg}`}>
                <span className="material-symbols-outlined text-2xl">{meta.icon}</span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-text-sub">{meta.subtitle}</p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main">{meta.title}</h1>
              </div>
            </div>

            {meta.description ? (
              <p className="max-w-3xl text-sm font-medium leading-relaxed text-text-sub">{meta.description}</p>
            ) : null}
          </div>

          {meta.status ? (
            <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusTone(meta.status)}`}>
              {meta.status}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {summaryRows.length > 0 ? (
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                <span className="material-symbols-outlined text-primary text-xl">info</span>
                <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Summary</h2>
              </div>
              <div className="p-8 grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                <span className="material-symbols-outlined text-primary text-xl">notes</span>
                <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Context</h2>
              </div>
              <div className="p-8 space-y-6">
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
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                <span className="material-symbols-outlined text-primary text-xl">dns</span>
                <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Technical Details</h2>
              </div>
              <div className="p-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                {technicalRows.map((row) => (
                  <div key={row.label} className="rounded-[24px] border border-gray-100 bg-[#F8F9FB] p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-sub opacity-60">{row.label}</p>
                    <p className="mt-2 text-sm font-bold text-text-main break-all">{row.value}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {structuredData ? (
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                <span className="material-symbols-outlined text-primary text-xl">data_object</span>
                <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Structured Data</h2>
              </div>
              <div className="p-8">
                <pre className="overflow-x-auto rounded-[24px] bg-[#F8F9FB] p-5 text-xs font-medium text-text-main">{structuredData}</pre>
              </div>
            </section>
          ) : null}

          {!summaryRows.length && !contextSections.length && !technicalRows.length && !structuredData && !metadataRows.length ? (
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
              <div className="p-8">
                <p className="text-sm font-bold text-text-main">No additional activity metadata was stored for this record.</p>
              </div>
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          {metadataRows.length > 0 ? (
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden sticky top-28">
              <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                <span className="material-symbols-outlined text-primary text-xl">badge</span>
                <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Metadata</h2>
              </div>
              <div className="p-8 space-y-4">
                {metadataRows.map((row) => (
                  <div key={row.label} className="rounded-[24px] border border-gray-100 bg-[#F8F9FB] p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-sub opacity-60">{row.label}</p>
                    <p className="mt-2 text-sm font-bold text-text-main break-all">{row.value}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
};
