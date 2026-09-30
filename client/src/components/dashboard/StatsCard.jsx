import { TONE_TILE_CLASSES } from '../../utils/tones';

// One KPI tile. Render inside a <dl> so each label/value pair is announced together.
const StatsCard = ({ title, value, icon: Icon, tone = 'neutral' }) => {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <dt className="text-sm font-medium text-muted-foreground">{title}</dt>
        {Icon && (
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${TONE_TILE_CLASSES[tone]}`}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <dd className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</dd>
    </div>
  );
};

export default StatsCard;
