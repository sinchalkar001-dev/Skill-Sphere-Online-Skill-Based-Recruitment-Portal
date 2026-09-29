import { getStatusColor } from '../../utils/helpers';

const StatusBadge = ({ status }) => {
  return (
    <span className={getStatusColor(status)}>
      {status}
    </span>
  );
};

export default StatusBadge;
