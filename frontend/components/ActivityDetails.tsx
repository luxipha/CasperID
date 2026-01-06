
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

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
        console.error('Failed to fetch activity detail:', err);
        setError(err.message || 'Failed to load activity details');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetail();
  }, [activityId]);

  // Helper for displaying activity type
  const getActivityTypeInfo = () => {
    if (!activity) return { title: 'Activity', action: 'Loading...', type: 'General', icon: 'info', status: 'Unknown', statusClass: 'bg-gray-100 text-gray-600' };

    if (activity.viewerWallet !== undefined) {
      // ViewEvent
      return {
        title: 'Profile View',
        action: activity.endpoint || 'Public Profile',
        type: 'Profile View Activity',
        icon: 'visibility',
        status: 'Success',
        statusClass: 'bg-green-100 text-green-800',
        entity: activity.viewerWallet === 'anonymous' ? 'Anonymous Visitor' : activity.viewerWallet.substring(0, 12) + '...'
      };
    } else if (activity.tier && activity.status) {
      // Verification Request
      const tierLabels: { [key: string]: string } = { layer_1: 'Basic', layer_2: 'Liveness', layer_3: 'Full KYC' };
      const statusLabels: { [key: string]: string } = { pending: 'Pending', approved: 'Success', rejected: 'Failed' };
      const statusClasses: { [key: string]: string } = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
      };
      return {
        title: `${tierLabels[activity.tier] || activity.tier} Verification`,
        action: `Tier ${activity.tier} Verification Request`,
        type: 'KYC Verification',
        icon: 'verified_user',
        status: statusLabels[activity.status] || activity.status,
        statusClass: statusClasses[activity.status] || statusClasses.pending,
        entity: 'CasperID Core'
      };
    } else if (activity.credential_hash) {
      // Credential
      return {
        title: 'Credential Issued',
        action: `${activity.tier || 'Identity'} Credential Added`,
        type: 'Credential Issuance',
        icon: 'card_membership',
        status: 'Success',
        statusClass: 'bg-green-100 text-green-800',
        entity: activity.issuer_id || 'CasperID'
      };
    }
    // Default for other activity types or if specific fields are missing
    return {
      title: activity.event_type || 'Activity',
      action: activity.action || 'Unknown Action',
      type: activity.category || 'General',
      icon: 'info',
      status: activity.status || 'Unknown',
      statusClass: activity.status === 'success' ? 'bg-green-100 text-green-800' : activity.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600',
      entity: activity.entity_name || 'Unknown'
    };
  };

  const typeInfo = getActivityTypeInfo();
  const formattedDate = activity?.created_at || activity?.timestamp
    ? new Date(activity.created_at || activity.timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
    : 'Unknown';

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
      {/* Top Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors font-bold text-sm group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Activity Log
          </button>

          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main">
              {typeInfo.title}
            </h1>
            <span className={`inline - flex items - center gap - 1.5 px - 3 py - 1 rounded - full text - [10px] font - black border uppercase tracking - widest ${typeInfo.statusClass} `}>
              <span className="material-symbols-outlined text-sm icon-filled">
                {typeInfo.status === 'Success' ? 'check_circle' : typeInfo.status === 'Failed' ? 'error' : 'schedule'}
              </span>
              {typeInfo.status}
            </span>
          </div>
          <div className="inline-block px-3 py-1 bg-gray-100 rounded-lg text-[11px] font-mono text-text-sub border border-gray-200">
            ID: {activity._id}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-text-main hover:bg-gray-50 transition-all shadow-sm">
            <span className="material-symbols-outlined text-lg">upload</span>
            Export
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">report_problem</span>
            Report Issue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Event Summary */}
          <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
              <span className="material-symbols-outlined text-primary text-xl">info</span>
              <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Event Summary</h2>
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-1.5 opacity-60">Event Type</p>
                <p className="text-base font-bold text-text-main">{typeInfo.type}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-1.5 opacity-60">Action</p>
                <p className="text-base font-bold text-text-main">{typeInfo.action}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-1.5 opacity-60">Date & Time</p>
                <p className="text-base font-bold text-text-main">{formattedDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-1.5 opacity-60">Involved Entity</p>
                <p className="text-base font-bold text-text-main">{typeInfo.entity}</p>
              </div>
            </div>
          </section>


          {/* Contextual Details - Always show for all activities as requested */}
          <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
              <span className="material-symbols-outlined text-primary text-xl">fingerprint</span>
              <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Contextual Details</h2>
            </div>
            <div className="p-8 space-y-8">
              {/* Alert Banner - Show for Anonymous Views OR Failed Events */}
              {(activity.viewerWallet === 'anonymous' || typeInfo.status === 'Failed' || typeInfo.status === 'Rejected') && (
                <div className={`border rounded-[24px] p-6 flex gap-4 ${typeInfo.status === 'Failed' || typeInfo.status === 'Rejected' ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                    <span className={`material-symbols-outlined ${typeInfo.status === 'Failed' || typeInfo.status === 'Rejected' ? 'text-orange-500' : 'text-gray-500'}`}>warning</span>
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm mb-1 ${typeInfo.status === 'Failed' || typeInfo.status === 'Rejected' ? 'text-orange-900' : 'text-gray-900'}`}>
                      {typeInfo.status === 'Failed' || typeInfo.status === 'Rejected' ? 'Suspicious Activity Detected' : 'Anonymous Profile View'}
                    </h4>
                    <p className={`text-xs leading-relaxed font-medium ${typeInfo.status === 'Failed' || typeInfo.status === 'Rejected' ? 'text-orange-800' : 'text-gray-600'}`}>
                      {typeInfo.status === 'Failed' || typeInfo.status === 'Rejected'
                        ? 'This activity originated from an unrecognized source or failed security checks. Review the details below to verify if this activity seems legitimate.'
                        : 'This profile view came from an anonymous visitor. Review the details below to verify if this activity seems legitimate.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">IP Address</p>
                  <span className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-text-main border border-gray-200">
                    {activity.ip || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Location</p>
                  <div className="flex items-center gap-2 text-text-main font-bold">
                    <span className="material-symbols-outlined text-blue-500">public</span>
                    <span>{activity.location || 'Unknown Location'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Device Type</p>
                  <div className="flex items-center gap-2 text-text-main font-bold">
                    <span className="material-symbols-outlined text-text-sub">
                      {activity.parsedUA?.device?.type === 'mobile' || activity.parsedUA?.device?.type === 'tablet' ? 'smartphone' : 'desktop_windows'}
                    </span>
                    <span>
                      {activity.parsedUA?.device?.vendor && activity.parsedUA?.device?.model
                        ? `${activity.parsedUA.device.vendor} ${activity.parsedUA.device.model}`
                        : activity.parsedUA?.device?.type === 'mobile' || activity.parsedUA?.device?.type === 'tablet'
                          ? 'Mobile Device'
                          : activity.parsedUA?.device?.type
                            ? 'Desktop'
                            : activity.userAgent?.toLowerCase().includes('mobile')
                              ? 'Mobile Device'
                              : 'Desktop'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Browser</p>
                  <div className="flex items-center gap-2 text-text-main font-bold font-sans">
                    {activity.parsedUA?.browser?.name
                      ? `${activity.parsedUA.browser.name} ${activity.parsedUA.browser.version ? activity.parsedUA.browser.version.split('.')[0] : ''}`
                      : activity.userAgent?.includes('Chrome') ? 'Chrome'
                        : activity.userAgent?.includes('Firefox') ? 'Firefox'
                          : activity.userAgent?.includes('Safari') ? 'Safari'
                            : 'Unknown Browser'}
                  </div>
                </div>
                {activity.parsedUA?.os && (
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Operating System</p>
                    <div className="flex items-center gap-2 text-text-main font-bold font-sans">
                      {activity.parsedUA.os.name} {activity.parsedUA.os.version || ''}
                    </div>
                  </div>
                )}
              </div>

              {/* Map Placeholder */}
              <div className="relative w-full aspect-[2/1] bg-gray-100 rounded-[24px] overflow-hidden border border-gray-200 group">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200&h=600"
                  className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt="Location Map"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent"></div>
                {/* Map Marker Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-orange-500/20 rounded-full animate-ping"></div>
                    <div className="bg-white shadow-xl rounded-full px-4 py-2 border border-orange-100 flex items-center gap-2 whitespace-nowrap">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span className="text-[11px] font-extrabold text-text-main uppercase tracking-widest">
                        {typeInfo.status === 'Failed' || typeInfo.status === 'Rejected' ? 'Activity Origin' : 'View Origin'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: Activity Metadata or Recommended Actions */}
        <div className="space-y-6">
          <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden sticky top-28">
            <div className={`px-8 py-5 border-b border-gray-50 flex items-center gap-3 ${typeInfo.status === 'Failed' || typeInfo.status === 'Rejected' ? 'bg-red-50/50' : 'bg-gray-50/30'}`}>
              <span className={`material-symbols-outlined text-xl ${typeInfo.status === 'Failed' || typeInfo.status === 'Rejected' ? 'text-red-500' : 'text-primary'}`}>
                {typeInfo.status === 'Failed' || typeInfo.status === 'Rejected' ? 'security' : 'info'}
              </span>
              <h2 className={`text-sm font-black uppercase tracking-widest ${typeInfo.status === 'Failed' || typeInfo.status === 'Rejected' ? 'text-red-900' : 'text-text-main'}`}>
                {typeInfo.status === 'Failed' || typeInfo.status === 'Rejected' ? 'Security Actions' : 'Activity Metadata'}
              </h2>
            </div>

            <div className="p-8 space-y-6">
              {typeInfo.status === 'Failed' || typeInfo.status === 'Rejected' ? (
                /* Security Warnings for Failed Events */
                <>
                  <p className="text-[13px] text-text-sub font-medium leading-relaxed">
                    This activity was flagged as failed or suspicious. We recommend reviewing your security settings.
                  </p>

                  <div className="space-y-3">
                    {[
                      { label: 'Review Apps', sub: 'Check connected integrations', icon: 'apps' },
                      { label: 'Change Password', sub: 'Secure your account', icon: 'lock_reset' },
                      { label: 'Contact Support', sub: 'Get help with this issue', icon: 'support_agent' },
                    ].map((action, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center justify-between p-4 rounded-[20px] border border-gray-100 hover:border-red-200 hover:bg-red-50/10 transition-all group shadow-sm text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-text-sub group-hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-xl">{action.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-main">{action.label}</p>
                            <p className="text-[11px] text-text-sub font-medium">{action.sub}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-text-sub group-hover:text-red-500 transition-all">chevron_right</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Standard Metadata for Normal/Success Events */
                <>
                  <div>
                    <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Activity ID</p>
                    <p className="text-xs font-mono text-text-main break-all bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 select-all">{activity._id}</p>
                  </div>

                  {activity.tier && (
                    <div>
                      <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Tier Level</p>
                      <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/20 inline-block">
                        {activity.tier.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  )}

                  {activity.credential_hash && (
                    <div>
                      <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Credential Hash</p>
                      <div className="flex items-center gap-2 text-xs font-mono text-text-main bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <span className="truncate">{activity.credential_hash}</span>
                        <span className="material-symbols-outlined text-[14px] text-text-sub cursor-pointer hover:text-primary">content_copy</span>
                      </div>
                    </div>
                  )}

                  {activity.status && (
                    <div>
                      <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Status Code</p>
                      <p className="text-sm font-bold text-text-main capitalize">{activity.status}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/20 text-center">
              <p className="text-[10px] text-text-sub font-bold uppercase tracking-[0.2em] opacity-40">
                Created: {new Date(activity.created_at || activity.timestamp).toLocaleDateString()}
              </p>
            </div>
          </section>
        </div>
      </div >
    </div >
  );
};
