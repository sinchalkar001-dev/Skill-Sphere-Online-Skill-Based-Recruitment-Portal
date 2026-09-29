const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-20 h-20 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-6">
          <span className="text-4xl">{icon}</span>
        </div>
      )}
      <h3 className="text-xl font-semibold text-surface-200 mb-2">{title}</h3>
      {description && (
        <p className="text-surface-400 max-w-md mb-6">{description}</p>
      )}
      {action && action}
    </div>
  );
};

export default EmptyState;
