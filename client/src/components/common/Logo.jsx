// The mark is a ring of four rubric segments around a core, echoing the score meters used across the app.
export const LogoMark = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
    <rect width="32" height="32" rx="8" className="fill-primary" />
    <g fill="none" strokeWidth="3" className="stroke-primary-foreground">
      <path d="M11.3 8.92A8.5 8.5 0 0 1 20.7 8.92" />
      <path d="M23.08 11.3A8.5 8.5 0 0 1 23.08 20.7" />
      <path d="M20.7 23.08A8.5 8.5 0 0 1 11.3 23.08" />
      <path d="M8.92 20.7A8.5 8.5 0 0 1 8.92 11.3" />
    </g>
    <circle cx="16" cy="16" r="2.5" className="fill-primary-foreground" />
  </svg>
);

const Logo = ({ className = '', markClassName = 'h-8 w-8' }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <LogoMark className={markClassName} />
    <span className="text-[1.0625rem] font-bold tracking-tight text-foreground">Skill Sphere</span>
  </span>
);

export default Logo;
