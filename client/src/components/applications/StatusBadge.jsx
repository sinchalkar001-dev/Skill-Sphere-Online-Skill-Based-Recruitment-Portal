import { getStatusColor, getStatusLabel } from '../../utils/helpers';

const StatusBadge = ({ status, className = '' }) => {
  return (
    <span className={`${getStatusColor(status)} ${className}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {getStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
