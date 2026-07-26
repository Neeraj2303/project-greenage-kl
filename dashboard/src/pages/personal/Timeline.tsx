import React from 'react';
import { Calendar, HelpCircle, CheckCircle } from 'lucide-react';
import { PatientProfile } from '../../types';
import { RiskBadge } from '../../components/ui/UIComponents';

interface TimelineProps {
  patient: PatientProfile;
  darkMode: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ patient, darkMode }) => {
  const timepointNodes = [
    { key: 'BL', label: 'Baseline (Enrollment)', desc: 'Initial baseline screening and multi-omics profiling.' },
    { key: 'M6', label: 'Month 6 Follow-up', desc: 'Mid-point cardiovascular and molecular follow-up.' },
    { key: 'M12', label: 'Month 12 (Conclusion)', desc: 'Final exit trial assessments and full multi-omics sweep.' }
  ] as const;

  return (
    <div className="relative pl-8 sm:pl-12 py-4 space-y-8">
      {/* Central timeline connector line */}
      <div className="absolute left-[26px] sm:left-[34px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800" />

      {timepointNodes.map((node) => {
        const record = patient.timepoints[node.key];
        const isCompleted = !!record;
        
        return (
          <div key={node.key} className="relative flex flex-col gap-2">
            {/* Timeline node icon */}
            <div className={`absolute -left-[30px] sm:-left-[38px] top-1.5 h-6 w-6 rounded-full flex items-center justify-center border-2 z-10 ${
              isCompleted 
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-200/50'
                : 'bg-slate-100 border-slate-300 dark:bg-slate-900 dark:border-slate-700 text-slate-400'
            }`}>
              {isCompleted ? <CheckCircle size={12} /> : <HelpCircle size={12} />}
            </div>

            {/* Timeline Content */}
            <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 max-w-3xl ${
              isCompleted
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                : 'bg-slate-100/50 dark:bg-slate-950/20 border-slate-200/50 dark:border-slate-800/50 opacity-60'
            }`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isCompleted ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {node.key} Node
                  </span>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">{node.label}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{node.desc}</p>
                </div>
                {!isCompleted && (
                  <span className="text-xs font-semibold text-slate-400">Scheduled / Pending</span>
                )}
              </div>

              {isCompleted ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Blood Pressure</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                      {Math.round(record.vitals.sbpAvg)}/{Math.round(record.vitals.dbpAvg)} mmHg
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-slate-400 block font-medium">FABP-NIR</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                      {record.fabpNir.value.toFixed(1)} ng/mL
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">BMI Index</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                      {record.anthropometry.bmi.toFixed(1)} kg/m²
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">LVEF Score</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                      {record.echo.lvef.toFixed(0)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Compliance</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                      {patient.group === 'CTRL' ? 'N/A' : `${record.compliance.overallPct.toFixed(1)}%`}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Risk Score</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                      {record.genomics.totalScore} pts
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 italic">
                  <Calendar size={14} />
                  <span>Timeline assessment pending participant milestone completion.</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
