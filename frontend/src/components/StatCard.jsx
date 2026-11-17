import React from "react";

export default function StatCard({ title, value, subtitle, icon: Icon, color = "blue", badge }) {
  const colorThemes = {
    blue: {
      bg: "bg-blue-50/60",
      iconBg: "bg-blue-100 text-navy-700",
      border: "border-blue-100",
      text: "text-navy-900"
    },
    emerald: {
      bg: "bg-emerald-50/50",
      iconBg: "bg-emerald-100 text-emerald-800",
      border: "border-emerald-100",
      text: "text-emerald-950"
    },
    amber: {
      bg: "bg-amber-50/50",
      iconBg: "bg-amber-100 text-amber-800",
      border: "border-amber-100",
      text: "text-amber-950"
    },
    rose: {
      bg: "bg-rose-50/50",
      iconBg: "bg-rose-100 text-rose-800",
      border: "border-rose-100",
      text: "text-rose-950"
    },
    purple: {
      bg: "bg-purple-50/50",
      iconBg: "bg-purple-100 text-purple-800",
      border: "border-purple-100",
      text: "text-purple-950"
    }
  };

  const theme = colorThemes[color] || colorThemes.blue;

  return (
    <div className={`p-5 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${theme.border}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold tracking-tight ${theme.text}`}>{value}</span>
            {badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 leading-snug">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${theme.iconBg} shadow-sm shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
