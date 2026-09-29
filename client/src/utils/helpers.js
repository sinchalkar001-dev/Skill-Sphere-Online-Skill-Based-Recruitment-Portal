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
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };
  if (salary.min && salary.max) {
    return `${formatNum(salary.min)} - ${formatNum(salary.max)} / ${salary.period || 'yr'}`;
  }
  return salary.min ? `From ${formatNum(salary.min)}` : `Up to ${formatNum(salary.max)}`;
};

export const getStatusColor = (status) => {
  const colors = {
    applied: 'badge-applied',
    reviewing: 'badge-reviewing',
    shortlisted: 'badge-shortlisted',
    assessed: 'badge-assessed',
    accepted: 'badge-accepted',
    rejected: 'badge-rejected',
  };
  return colors[status] || 'badge-applied';
};

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
  const labels = { remote: '🏠 Remote', onsite: '🏢 On-site', hybrid: '🔄 Hybrid' };
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
