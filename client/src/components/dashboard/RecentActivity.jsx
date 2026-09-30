import { formatTimeAgo } from '../../utils/helpers';
import NotificationIcon from '../notifications/NotificationIcon';

const RecentActivity = ({ activities = [] }) => {
  return (
    <section className="card p-5" aria-labelledby="recent-activity-title">
      <h2 id="recent-activity-title" className="section-title">
        Recent activity
      </h2>

      {activities.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nothing new yet. Updates will appear here as they happen.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {activities.slice(0, 6).map((activity, index) => (
            <li key={activity._id || index} className="flex gap-3">
              <NotificationIcon type={activity.type} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {activity.title}
                  {!activity.isRead && <span className="sr-only"> (unread)</span>}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{activity.message}</p>
                <p className="mt-1 text-xs text-subtle-foreground">
                  <time dateTime={activity.createdAt}>{formatTimeAgo(activity.createdAt)}</time>
                </p>
              </div>
              {!activity.isRead && <span aria-hidden="true" className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RecentActivity;
