import React from 'react';
import { LucideIcon } from 'lucide-react';
import { PatientRecord, Demographics } from '../../types';

// Risk Badge component
interface RiskBadgeProps {
  status: 'healthy' | 'warning' | 'critical' | 'diagnostic' | string;
  label: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ status, label }) => {
  let styleClass = 'badge-diagnostic';
  if (status === 'healthy' || label.toLowerCase().includes('normal') || label.toLowerCase().includes('low risk') || label.toLowerCase().includes('tertile 1') || label.toLowerCase().includes('complete') || label.toLowerCase().includes('balanced')) {
    styleClass = 'badge-healthy';
  } else if (status === 'warning' || label.toLowerCase().includes('mild') || label.toLowerCase().includes('borderline') || label.toLowerCase().includes('moderate') || label.toLowerCase().includes('elevated') || label.toLowerCase().includes('tertile 2') || label.toLowerCase().includes('partial')) {
    styleClass = 'badge-warning';
  } else if (status === 'critical' || label.toLowerCase().includes('high') || label.toLowerCase().includes('reduced') || label.toLowerCase().includes('dysfunction') || label.toLowerCase().includes('severe') || label.toLowerCase().includes('tertile 3') || label.toLowerCase().includes('pending') || label.toLowerCase().includes('critical')) {
    styleClass = 'badge-critical';
  }

  return (
    <span className={`medical-badge ${styleClass}`}>
      {label}
    </span>
  );
};

// Metric Card component
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  status?: 'healthy' | 'warning' | 'critical' | 'diagnostic';
  icon?: LucideIcon;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtext,
  status = 'diagnostic',
  icon: Icon,
  onClick
}) => {
  let borderStyle = 'border-slate-200 dark:border-slate-800';
  let titleColor = 'text-slate-500 dark:text-slate-400';
  let iconBg = 'bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400';

  if (status === 'healthy') {
    borderStyle = 'border-emerald-200 dark:border-emerald-950/40';
    iconBg = 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400';
  } else if (status === 'warning') {
    borderStyle = 'border-amber-200 dark:border-amber-950/40';
    iconBg = 'bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400';
  } else if (status === 'critical') {
    borderStyle = 'border-rose-200 dark:border-rose-950/40';
    iconBg = 'bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400';
  }

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-xl p-5 border ${borderStyle} shadow-sm transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className={`text-xs font-semibold uppercase tracking-wider ${titleColor}`}>{title}</span>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold font-sans text-slate-800 dark:text-slate-100">{value}</span>
            {unit && <span className="text-xs text-slate-500 dark:text-slate-400 ml-1 font-semibold">{unit}</span>}
          </div>
          {subtext && <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${iconBg}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
};

// Patient Banner / Header component
interface PatientBannerProps {
  pid: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  district: string;
  group: 'TEST' | 'CTRL';
  timepoint: 'BL' | 'M3' | 'M6' | 'M12';
  healthScore: number;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({
  pid,
  name,
  age,
  gender,
  district,
  group,
  timepoint,
  healthScore
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            {'P'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Participant {pid}</h2>
              <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                {pid}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                group === 'TEST' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50' 
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-200/50'
              }`}>
                {group} Group
              </span>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-slate-500 dark:text-slate-400">
              <div>
                <strong>Age:</strong> {age} yrs
              </div>
              <div>
                <strong>Gender:</strong> {gender === 'M' ? 'Male' : 'Female'}
              </div>
              <div>
                <strong>District:</strong> {district}
              </div>
              <div>
                <strong>Timepoint:</strong> <span className="font-bold text-blue-600 dark:text-blue-400">{timepoint}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 pt-4 lg:pt-0">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase">Overall Health Index</span>
            <div className="flex items-center gap-2 justify-end mt-0.5">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{healthScore}</span>
              <span className="text-sm text-slate-400">/100</span>
            </div>
          </div>
          <div className="h-12 w-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                healthScore >= 80 ? 'bg-emerald-500' : healthScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ height: `${healthScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Header component
interface SectionHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, children }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{title}</h1>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
};
