const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-10 w-10 border-[3px]',
};

const LoadingSpinner = ({ size = 'md', className = '', label = 'Loading' }) => {
  return (
    <span role="status" className={`inline-flex items-center justify-center ${className}`}>
      <span aria-hidden="true" className={`${sizes[size]} animate-spin rounded-full border-border border-t-primary`} />
      <span className="sr-only">{label}</span>
    </span>
  );
};

// Inherits the button's text color, so it works on any button variant.
export const ButtonSpinner = () => (
  <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
);

export const PageLoader = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
    <LoadingSpinner size="lg" />
    <p aria-hidden="true" className="text-sm text-muted-foreground">
      Loading…
    </p>
  </div>
);

export default LoadingSpinner;
