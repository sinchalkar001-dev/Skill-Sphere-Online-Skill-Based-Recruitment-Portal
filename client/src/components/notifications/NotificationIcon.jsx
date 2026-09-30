import {
  InboxArrowDownIcon,
  StarIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  HandRaisedIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { TONE_TILE_CLASSES } from '../../utils/tones';

const META = {
  application_received: { Icon: InboxArrowDownIcon, tone: 'info' },
  shortlisted: { Icon: StarIcon, tone: 'info' },
  rejected: { Icon: XCircleIcon, tone: 'danger' },
  accepted: { Icon: CheckCircleIcon, tone: 'success' },
  assessment_complete: { Icon: ClipboardDocumentCheckIcon, tone: 'iris' },
  welcome: { Icon: HandRaisedIcon, tone: 'info' },
  application_status_change: { Icon: ArrowPathIcon, tone: 'warning' },
  new_job_match: { Icon: BriefcaseIcon, tone: 'info' },
};

const FALLBACK = { Icon: BellIcon, tone: 'neutral' };

const NotificationIcon = ({ type, className = '' }) => {
  const { Icon, tone } = META[type] || FALLBACK;
  return (
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${TONE_TILE_CLASSES[tone]} ${className}`}
    >
      <Icon className="h-[1.125rem] w-[1.125rem]" />
    </span>
  );
};

export default NotificationIcon;
