const StatsCard = ({ title, value, icon, trend, color = 'primary' }) => {
  const colors = {
    primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/20 text-primary-400',
    accent: 'from-accent-500/20 to-accent-600/10 border-accent-500/20 text-accent-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/20 text-rose-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[color]} border p-5 transition-all hover:shadow-glass`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-surface-100">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-surface-800/50 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      {/* Decorative element */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full" />
    </div>
  );
};

export default StatsCard;
