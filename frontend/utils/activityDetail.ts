type ActivityRecord = Record<string, any> | null | undefined;

export function formatTimestamp(value?: string | number | Date) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function formatTimeAgo(value?: string | number | Date) {
  if (!value) return null;

  const timestamp = typeof value === 'string' || typeof value === 'number'
    ? new Date(value).getTime()
    : value.getTime();

  if (Number.isNaN(timestamp)) return null;

  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

export function getStatusTone(status?: string) {
  const normalized = status?.toLowerCase() || '';
  if (normalized.includes('fail') || normalized.includes('reject')) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (normalized.includes('pending') || normalized.includes('progress')) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  if (normalized.includes('success') || normalized.includes('approved') || normalized.includes('complete')) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (normalized.includes('new') || normalized.includes('read')) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

function formatTier(value?: string) {
  if (!value) return null;
  const map: Record<string, string> = {
    layer_1: 'Basic Verification',
    layer_2: 'Liveness Check',
    layer_3: 'Full KYC',
  };
  return map[value] || value.replace(/_/g, ' ');
}

function getDeviceLabel(activity: ActivityRecord) {
  const vendor = activity?.parsedUA?.device?.vendor;
  const model = activity?.parsedUA?.device?.model;
  if (vendor && model) return `${vendor} ${model}`;
  if (activity?.parsedUA?.device?.type) return activity.parsedUA.device.type;
  return null;
}

function getBrowserLabel(activity: ActivityRecord) {
  const name = activity?.parsedUA?.browser?.name;
  if (!name) return null;
  const version = activity?.parsedUA?.browser?.version;
  return version ? `${name} ${version}` : name;
}

function getOsLabel(activity: ActivityRecord) {
  const name = activity?.parsedUA?.os?.name;
  if (!name) return null;
  const version = activity?.parsedUA?.os?.version;
  return version ? `${name} ${version}` : name;
}

export function inferActivityMeta(activity: ActivityRecord) {
  if (!activity) {
    return {
      title: 'Activity Details',
      subtitle: 'Activity',
      icon: 'info',
      iconBg: 'bg-gray-100 text-gray-600',
      description: null,
      status: null,
      entity: null,
      eventType: null,
      action: null,
    };
  }

  if (activity.source === 'view' || activity.viewerWallet !== undefined) {
    return {
      title: 'Profile View',
      subtitle: 'Activity Event',
      icon: 'visibility',
      iconBg: 'bg-blue-50 text-blue-600',
      description: activity.endpoint || null,
      status: activity.status || 'Success',
      entity: activity.viewerWallet === 'anonymous' ? 'Anonymous Visitor' : activity.viewerWallet || null,
      eventType: 'Profile View',
      action: activity.endpoint || 'Public Profile Access',
    };
  }

  if (activity.source === 'verification_v2' || activity.verification_tier) {
    const tier = formatTier(activity.verification_tier);
    return {
      title: activity.status === 'rejected' ? 'Verification Rejected' : 'KYC Verification',
      subtitle: 'Verification Event',
      icon: 'verified_user',
      iconBg: 'bg-primary/10 text-primary',
      description: activity.purpose || null,
      status: activity.status || null,
      entity: 'CasperID Core',
      eventType: tier,
      action: tier ? `${tier} Request` : 'Verification Request',
    };
  }

  if (activity.source === 'verification' || activity.tier) {
    const tier = formatTier(activity.tier);
    return {
      title: 'KYC Verification',
      subtitle: 'Verification Event',
      icon: 'verified_user',
      iconBg: 'bg-primary/10 text-primary',
      description: null,
      status: activity.status || null,
      entity: 'CasperID Core',
      eventType: tier,
      action: tier ? `${tier} Request` : 'Verification Request',
    };
  }

  if (activity.source === 'credential' || activity.credential_hash) {
    const tier = formatTier(activity.tier);
    return {
      title: 'Credential Issued',
      subtitle: 'Credential Event',
      icon: 'card_membership',
      iconBg: 'bg-indigo-50 text-indigo-600',
      description: tier ? `${tier} credential added` : 'Credential added',
      status: activity.revoked ? 'Revoked' : 'Success',
      entity: activity.issuer_id || 'CasperID',
      eventType: 'Credential',
      action: tier ? `${tier} Credential Issued` : 'Credential Issued',
    };
  }

  if (activity.source === 'notification' || activity.message || activity.title) {
    return {
      title: activity.title || 'Notification',
      subtitle: 'System Event',
      icon: 'notifications',
      iconBg: 'bg-gray-100 text-gray-700',
      description: activity.message || null,
      status: activity.read ? 'Read' : 'New',
      entity: 'CasperID',
      eventType: activity.type || 'Notification',
      action: activity.title || 'Notification',
    };
  }

  return {
    title: activity.action || activity.event_type || 'Activity Details',
    subtitle: 'CasperID Activity',
    icon: 'info',
    iconBg: 'bg-gray-100 text-gray-700',
    description: null,
    status: activity.status || null,
    entity: activity.entity_name || null,
    eventType: activity.category || activity.event_type || null,
    action: activity.action || null,
  };
}

export function buildSummaryRows(activity: ActivityRecord, activityId?: string | null) {
  const meta = inferActivityMeta(activity);
  const rows = [
    { label: 'Event Type', value: meta.eventType },
    { label: 'Action', value: meta.action },
    { label: 'Entity / App', value: meta.entity },
    { label: 'Status', value: meta.status },
    { label: 'Date & Time', value: formatTimestamp(activity?.created_at || activity?.timestamp || activity?.createdAt) },
    { label: 'Activity ID', value: activity?._id || activityId || null },
  ];
  return rows.filter((row) => row.value);
}

export function buildContextSections(activity: ActivityRecord) {
  if (!activity) return [];

  const context: Array<{ label: string; value: string }> = [];

  if (activity.message) context.push({ label: 'Message', value: activity.message });
  if (activity.purpose) context.push({ label: 'Purpose', value: activity.purpose });
  if (activity.endpoint) context.push({ label: 'Endpoint', value: activity.endpoint });
  if (activity.rejection_reason) context.push({ label: 'Rejection Reason', value: activity.rejection_reason });
  if (Array.isArray(activity.accessedFields) && activity.accessedFields.length > 0) {
    context.push({ label: 'Accessed Fields', value: activity.accessedFields.join(', ') });
  }
  if (Array.isArray(activity.requested_fields) && activity.requested_fields.length > 0) {
    context.push({ label: 'Requested Fields', value: activity.requested_fields.join(', ') });
  }

  return context;
}

export function buildTechnicalRows(activity: ActivityRecord) {
  if (!activity) return [];

  const rows = [
    { label: 'IP Address', value: activity.ip },
    { label: 'Location', value: activity.location },
    { label: 'Browser', value: getBrowserLabel(activity) },
    { label: 'Operating System', value: getOsLabel(activity) },
    { label: 'Device', value: getDeviceLabel(activity) },
    { label: 'User Agent', value: activity.userAgent },
  ];

  return rows.filter((row) => row.value);
}

export function buildMetadataRows(activity: ActivityRecord) {
  if (!activity) return [];

  const rows = [
    { label: 'Request ID', value: activity.request_id },
    { label: 'Dapp ID', value: activity.dapp_id },
    { label: 'Grant ID', value: activity.grant_id },
    { label: 'Tier', value: formatTier(activity.verification_tier || activity.tier) },
    { label: 'Issuer', value: activity.issuer_id },
    { label: 'Credential Hash', value: activity.credential_hash },
    { label: 'Human ID', value: activity.human_id },
    { label: 'Provider Reference', value: activity.verification_data?.provider_reference },
    { label: 'Verification Method', value: activity.verification_data?.verification_method },
    { label: 'Document Type', value: activity.verification_data?.document_type },
    { label: 'Submitted At', value: formatTimestamp(activity.verification_data?.submitted_at) || activity.verification_data?.submitted_at },
    { label: 'Completed At', value: formatTimestamp(activity.completed_at) },
    { label: 'Rejected At', value: formatTimestamp(activity.rejected_at) },
  ];

  return rows.filter((row) => row.value);
}
