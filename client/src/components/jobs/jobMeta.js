import {
  GlobeAltIcon,
  BuildingOfficeIcon,
  ArrowsRightLeftIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

// Icon for each work style (job.locationType).
export const WORK_STYLE_ICONS = {
  remote: GlobeAltIcon,
  onsite: BuildingOfficeIcon,
  hybrid: ArrowsRightLeftIcon,
};

export const getWorkStyleIcon = (type) => WORK_STYLE_ICONS[type] || MapPinIcon;
