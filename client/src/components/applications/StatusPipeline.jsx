import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';

const STAGES = [
  { value: 'applied', label: 'Applied' },
  { value: 'reviewing', label: 'In review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'assessed', label: 'Assessed' },
];

// How far the application got, and how it ended. Rejections are placed after
// the last stage recorded in the status history.
const getProgress = (status, history = []) => {
  const stageIndex = STAGES.findIndex((s) => s.value === status);
  if (stageIndex !== -1) return { reached: stageIndex, outcome: null };
  if (status === 'accepted') return { reached: STAGES.length - 1, outcome: 'accepted' };

  const lastStage = [...history]
    .reverse()
    .map((entry) => entry.status)
    .find((s) => STAGES.some((stage) => stage.value === s));
  const reached = lastStage ? STAGES.findIndex((s) => s.value === lastStage) : 0;
  return { reached, outcome: 'rejected' };
};

const circleStyles = {
  done: 'bg-primary text-primary-foreground',
  current: 'border-2 border-primary bg-card',
  upcoming: 'border-2 border-border-strong bg-card',
  accepted: 'bg-success text-white',
  rejected: 'bg-danger text-danger-foreground',
};

const stateText = {
  done: 'completed',
  current: 'current stage',
  upcoming: 'not reached',
  accepted: 'accepted',
  rejected: 'rejected',
};

const StatusPipeline = ({ status, history, className = '' }) => {
  const { reached, outcome } = getProgress(status, history);

  const steps = [
    ...STAGES.map((stage, i) => {
      let state = 'upcoming';
      if (i < reached || (i === reached && outcome)) state = 'done';
      else if (i === reached) state = 'current';
      return { ...stage, state };
    }),
    {
      value: 'decision',
      label: outcome === 'accepted' ? 'Accepted' : outcome === 'rejected' ? 'Rejected' : 'Decision',
      state: outcome || 'upcoming',
    },
  ];

  return (
    <ol aria-label="Application progress" className={`flex flex-col sm:grid sm:grid-cols-5 ${className}`}>
      {steps.map((step, i) => {
        const next = steps[i + 1];
        const nextReached = next && next.state !== 'upcoming';
        return (
          <li
            key={step.value}
            aria-current={step.state === 'current' ? 'step' : undefined}
            className="relative flex items-center gap-3 pb-5 last:pb-0 sm:flex-col sm:gap-0 sm:pb-0 sm:text-center"
          >
            {next && (
              <span
                aria-hidden="true"
                className={`absolute bottom-0 left-[13px] top-7 w-0.5 sm:bottom-auto sm:left-[calc(50%_+_14px)] sm:right-[calc(-50%_+_14px)] sm:top-[13px] sm:h-0.5 sm:w-auto ${
                  nextReached ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${circleStyles[step.state]}`}
            >
              {(step.state === 'done' || step.state === 'accepted') && <CheckIcon className="h-4 w-4" />}
              {step.state === 'rejected' && <XMarkIcon className="h-4 w-4" />}
              {step.state === 'current' && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </span>
            <span
              className={`text-sm sm:mt-2 sm:text-xs ${
                step.state === 'upcoming' ? 'text-muted-foreground' : 'font-semibold text-foreground'
              }`}
            >
              {step.label}
              <span className="sr-only"> ({stateText[step.state]})</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default StatusPipeline;
