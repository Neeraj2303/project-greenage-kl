import React from 'react';
import { Calendar, CheckCircle, Percent, Info } from 'lucide-react';
import { PatientRecord, PatientProfile } from '../../types';
import EChart from '../../components/charts/EChart';
import { getBarOption } from '../../components/charts/EChartTemplates';

interface InterventionProps {
  patient: PatientProfile;
  record: PatientRecord;
  darkMode: boolean;
}

export const Intervention: React.FC<InterventionProps> = ({ patient, record, darkMode }) => {
  const isCtrl = patient.group === 'CTRL';
  const compliancePct = record.compliance.overallPct;

  // 1. Weekly Dosage Bar Chart
  const weekLabels = record.compliance.records.map(r => `W${r.week}`);
  const consumedData = record.compliance.records.map(r => r.consumed);
  const deliveredData = record.compliance.records.map(r => r.delivered);

  const complianceChartOption = getBarOption(
    'Fortnightly Microgreen Supplement Adherence (g)',
    weekLabels,
    [
      { name: 'Dose Delivered', data: deliveredData, color: '#cbd5e1' },
      { name: 'Dose Consumed', data: consumedData, color: '#10b981' }
    ],
    'grams',
    darkMode
  );

  if (isCtrl) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center max-w-lg mx-auto shadow-sm">
        <Info className="text-blue-500 mx-auto mb-4" size={32} />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Supplement Tracking Not Applicable</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Participant <strong>{patient.name}</strong> is randomized to the <strong>Control Group (standard lifestyle)</strong>. 
          Microgreen supplement logs, dosage delivered/consumed checks, and compliance tracking are only active for the intervention group cohort.
        </p>
      </div>
    );
  }

  // Draw circular SVG progress ring parameters
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (compliancePct / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progress Ring Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-6">
          <div className="relative flex justify-center items-center h-28 w-28 shrink-0">
            {/* SVG circle meter */}
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="text-slate-100 dark:text-slate-800"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="text-emerald-500"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{compliancePct.toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-semibold block">%</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Overall Compliance</h4>
            <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">Adherence Level</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2 ${
              compliancePct >= 85 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
            }`}>
              <CheckCircle size={12} />
              {compliancePct >= 85 ? 'Highly Compliant' : 'Moderately Compliant'}
            </span>
          </div>
        </div>

        {/* Adherence details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Log Duration</span>
            <div className="text-2xl font-bold mt-1 flex items-center gap-2">
              <Calendar size={20} className="text-blue-500" />
              {record.compliance.records.length} Fortnights
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Log captures weeks 1 through {record.compliance.records.length * 2} of the supplementation protocol.
            </p>
          </div>
        </div>

        {/* Tolerability details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Tolerability Index</span>
            <div className="text-2xl font-bold mt-1 flex items-center gap-2">
              <Percent size={20} className="text-indigo-500" />
              100% Tolerance
            </div>
            <p className="text-xs text-slate-400 mt-2">
              No severe side effects or GI intolerance noted during fortnightly clinic visits.
            </p>
          </div>
        </div>

      </div>

      {/* Chart & Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Compliance dosage chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <EChart option={complianceChartOption} style={{ height: '300px' }} />
        </div>

        {/* Consumption History Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Supplement Log History</h3>
            <div className="overflow-y-auto max-h-[220px] pr-1">
              <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[9px]">
                  <tr>
                    <th className="py-2 px-1">Week</th>
                    <th className="py-2 px-1 text-center">Consumed (g)</th>
                    <th className="py-2 px-1 text-center">Adherence %</th>
                    <th className="py-2 px-1">Tolerability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {record.compliance.records.map((r, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="py-2 px-1 font-mono font-bold">W{r.week}</td>
                      <td className="py-2 px-1 text-center">{r.consumed}</td>
                      <td className={`py-2 px-1 text-center font-bold ${r.pct >= 85 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {r.pct.toFixed(0)}%
                      </td>
                      <td className="py-2 px-1">{r.tolerability}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Intervention;
