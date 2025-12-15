// components/StatsCard.js
export default function StatsCard({ title, value, icon: Icon, color = 'slate' }) {
  const colorConfig = {
    slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    red: { bg: 'bg-rose-50', text: 'text-rose-600' },
    purple: { bg: 'bg-violet-50', text: 'text-violet-600' },
    orange: { bg: 'bg-amber-50', text: 'text-amber-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  };

  const colors = colorConfig[color] || colorConfig.slate;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          {Icon && <Icon className={`w-5 h-5 ${colors.text}`} strokeWidth={1.75} />}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
          <p className="text-sm text-slate-500 truncate">{title}</p>
        </div>
      </div>
    </div>
  );
}
