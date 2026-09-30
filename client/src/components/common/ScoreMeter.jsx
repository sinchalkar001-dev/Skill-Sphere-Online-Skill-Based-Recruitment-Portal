const heights = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-2.5',
};

/**
 * Segmented rubric meter: one segment per point for small scales (a 10-point
 * criterion shows 10 segments), ten segments for larger ones (a percentage
 * lights one segment per 10%). Partial values fill a segment proportionally.
 */
const ScoreMeter = ({ value = 0, max = 10, label, size = 'md', animate = false, decorative = false, className = '' }) => {
  const safeMax = max > 0 ? max : 10;
  const clamped = Math.min(Math.max(Number(value) || 0, 0), safeMax);
  const segments = safeMax <= 12 ? safeMax : 10;
  const units = (clamped / safeMax) * segments;
  const description = `${label ? `${label}: ` : ''}${clamped} out of ${safeMax}`;
  // Decorative meters sit next to a control or text that already states the value.
  const a11yProps = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': description };

  return (
    <div {...a11yProps} className={`flex w-full gap-[2px] ${className}`}>
      {Array.from({ length: segments }, (_, i) => {
        const fill = Math.min(Math.max(units - i, 0), 1);
        return (
          <span key={i} className={`relative flex-1 overflow-hidden rounded-[2px] bg-meter-track ${heights[size]}`}>
            {fill > 0 && (
              <span
                className={`absolute inset-y-0 left-0 bg-primary ${animate ? 'origin-left animate-segment-fill' : ''}`}
                style={{ width: `${fill * 100}%`, ...(animate && { animationDelay: `${150 + i * 45}ms` }) }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
};

export default ScoreMeter;
