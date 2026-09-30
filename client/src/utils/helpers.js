import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
};

export const formatDateShort = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd');
};

export const formatTimeAgo = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatSalary = (salary) => {
  if (!salary || (!salary.min && !salary.max)) return 'Not disclosed';
  const formatNum = (n) => {
    if (n >= 100000) return `₹${parseFloat((n / 100000).toFixed(1))}L`;
    if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
    return `₹${n}`;
  };
  const periods = { yearly: 'yr', monthly: 'mo', hourly: 'hr' };
  const period = periods[salary.period] || salary.period || 'yr';
  if (salary.min && salary.max) {
    return `${formatNum(salary.min)}–${formatNum(salary.max)} / ${period}`;
  }
  return salary.min ? `From ${formatNum(salary.min)} / ${period}` : `Up to ${formatNum(salary.max)} / ${period}`;
};

// Application pipeline, in order. Badge classes are written out in full so Tailwind keeps them.
export const APPLICATION_STATUSES = [
  { value: 'applied', label: 'Applied', badge: 'badge-neutral' },
  { value: 'reviewing', label: 'In review', badge: 'badge-warning' },
  { value: 'shortlisted', label: 'Shortlisted', badge: 'badge-info' },
  { value: 'assessed', label: 'Assessed', badge: 'badge-iris' },
  { value: 'accepted', label: 'Accepted', badge: 'badge-success' },
  { value: 'rejected', label: 'Rejected', badge: 'badge-danger' },
];

const findStatus = (status) =>
  APPLICATION_STATUSES.find((s) => s.value === status) || APPLICATION_STATUSES[0];

export const getStatusLabel = (status) => findStatus(status).label;

export const getStatusColor = (status) => findStatus(status).badge;

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const getLocationTypeLabel = (type) => {
  const labels = { remote: 'Remote', onsite: 'On-site', hybrid: 'Hybrid' };
  return labels[type] || type;
};

export const getJobTypeLabel = (type) => {
  const labels = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
    'internship': 'Internship',
  };
  return labels[type] || type;
};

export const getExperienceLabel = (level) => {
  const labels = { entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', lead: 'Lead' };
  return labels[level] || level;
};
