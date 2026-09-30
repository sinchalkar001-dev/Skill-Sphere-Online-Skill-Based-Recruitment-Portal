import { BellIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import Avatar from '../common/Avatar';
import ScoreMeter from '../common/ScoreMeter';
import StatusBadge from '../applications/StatusBadge';

// Illustrative sample data: this mirrors the default assessment criteria recruiters score against.
const RUBRIC = [
  { name: 'Technical skills', score: 8 },
  { name: 'Problem solving', score: 9 },
  { name: 'Communication', score: 7 },
  { name: 'Project quality', score: 9 },
];

const TOTAL = RUBRIC.reduce((sum, row) => sum + row.score, 0);
const PERCENT = Math.round((TOTAL / (RUBRIC.length * 10)) * 100);

const HeroScorecard = () => (
  <div className="relative">
    <div aria-hidden="true" className="blueprint absolute inset-0 rounded-3xl border border-primary/15 bg-primary-soft/50" />

    <div className="relative px-4 py-8 sm:px-10 sm:py-12">
      <figure
        role="img"
        aria-label={`Example application: Arjun Mehta applied to TechCorp with a project, was scored ${PERCENT}% on a four-part rubric, and is at the assessed stage.`}
        className="relative mx-auto max-w-md rounded-2xl border border-border bg-card p-5 shadow-lift sm:p-6"
      >
        <div className="flex items-start gap-3">
          <Avatar name="Arjun Mehta" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">Arjun Mehta</p>
            <p className="truncate text-sm text-muted-foreground">Full-stack developer at TechCorp</p>
          </div>
          <StatusBadge status="assessed" />
        </div>

        <div className="mt-5 rounded-xl bg-muted/70 p-4">
          <p className="text-sm font-semibold text-foreground">Split: shared expenses in real time</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CodeBracketIcon aria-hidden="true" className="h-4 w-4" />
            github.com/arjun/split
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['React', 'Node.js', 'Socket.io'].map((tech) => (
              <span key={tech} className="chip bg-card">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-foreground">Rubric score</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{PERCENT}%</p>
          </div>
          <ul className="mt-3 space-y-3">
            {RUBRIC.map((row) => (
              <li key={row.name} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 sm:grid-cols-[8.5rem_1fr_2.5rem]">
                <span className="truncate text-xs font-medium text-muted-foreground">{row.name}</span>
                <ScoreMeter value={row.score} max={10} animate />
                <span className="text-right text-xs font-semibold tabular-nums text-foreground">{row.score}/10</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`h-1.5 flex-1 rounded-full ${step < 3 ? 'bg-primary' : step === 3 ? 'bg-iris' : 'bg-meter-track'}`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Stage 4 of 5, assessed. <span className="font-medium text-foreground">Decision next.</span>
          </p>
        </div>
      </figure>

      <div
        aria-hidden="true"
        className="relative mx-auto mt-4 flex max-w-xs items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lift lg:absolute lg:-bottom-5 lg:left-0 lg:mt-0 xl:-left-4"
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
          <BellIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">Your application was scored</p>
          <p className="text-xs text-muted-foreground">TechCorp, just now</p>
        </div>
      </div>
    </div>
  </div>
);

export default HeroScorecard;
