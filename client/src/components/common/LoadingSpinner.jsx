const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-surface-600 border-t-primary-500`}
      />
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-surface-400 animate-pulse">Loading...</p>
    </div>
  </div>
);

export default LoadingSpinner;
