import { formatTimeAgo } from '../../utils/helpers';

const RecentActivity = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-surface-100 mb-4">Recent Activity</h3>
        <p className="text-sm text-surface-400 text-center py-8">No recent activity</p>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    const icons = {
      application_received: '📩',
      shortlisted: '⭐',
      rejected: '❌',
      accepted: '✅',
      assessment_complete: '📝',
      welcome: '👋',
      application_status_change: '🔄',
      new_job_match: '🎯',
    };
    return icons[type] || '📌';
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-surface-100 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.slice(0, 6).map((activity, index) => (
          <div
            key={activity._id || index}
            className={`flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-surface-700/30 ${
              !activity.isRead ? 'bg-primary-500/5 border-l-2 border-primary-500' : ''
            }`}
          >
            <span className="text-lg flex-shrink-0 mt-0.5">
              {getActivityIcon(activity.type)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">
                {activity.title}
              </p>
              <p className="text-xs text-surface-400 mt-0.5 truncate">
                {activity.message}
              </p>
              <p className="text-[10px] text-surface-500 mt-1">
                {formatTimeAgo(activity.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
