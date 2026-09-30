const EmptyState = ({ icon: Icon, title, description, action, titleAs: Title = 'h3', className = '' }) => {
  return (
    <div className={`flex flex-col items-center px-6 py-14 text-center ${className}`}>
      {Icon && (
        <span
          aria-hidden="true"
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground"
        >
          <Icon className="h-6 w-6" />
        </span>
      )}
      <Title className="text-base font-semibold text-foreground">{title}</Title>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
