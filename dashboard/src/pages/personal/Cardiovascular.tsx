import React from 'react';
import { Heart, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { PatientRecord, PatientProfile } from '../../types';
import { MetricCard, RiskBadge } from '../../components/ui/UIComponents';
import EChart from '../../components/charts/EChart';
import { getGaugeOption, getLineTrendOption } from '../../components/charts/EChartTemplates';

interface CardiovascularProps {
  patient: PatientProfile;
  record: PatientRecord;
  darkMode: boolean;
}

export const Cardiovascular: React.FC<CardiovascularProps> = ({ patient, record, darkMode }) => {
  // 1. Gauges Configuration
  // LVEF Gauge: healthy is >= 55%
  const lvefOption = getGaugeOption(
    'Left Ventricular Ejection Fraction (LVEF)',
    record.echo.lvef,
    30,
    80,
    '%',
    [[0.3, '#ef4444'], [0.5, '#f59e0b'], [1, '#10b981']],
    darkMode
  );

  // GLS Gauge: healthy is <= -20% (since it's negative, smaller/more negative is better. Let's map absolute values for gauge display)
  // GLS value is e.g. -18. Absolute value is 18. Min 10, Max 25. High absolute is better (e.g. 21 is healthy, 15 is subclinical dysfunction)
  const glsAbs = Math.abs(record.echo.gls);
  const glsOption = getGaugeOption(
    'Global Longitudinal Strain |GLS|',
    glsAbs,
    10,
    25,
    '%',
    [[0.53, '#ef4444'], [0.66, '#f59e0b'], [1, '#10b981']], // absolute values: <18 is red, 18-20 is yellow, >20 is green
    darkMode
  );

  // BP Gauge: map SBP. Min 80, Max 200.
  const bpOption = getGaugeOption(
    'Systolic Blood Pressure (SBP)',
    record.vitals.sbpAvg,
    80,
    200,
    ' mmHg',
    [[0.33, '#10b981'], [0.42, '#f59e0b'], [1, '#ef4444']], // <120 green, 120-130 yellow, >130 red
    darkMode
  );

  // 2. Timeline history data
  const tps: ('BL' | 'M3' | 'M6' | 'M12')[] = ['BL', 'M3', 'M6', 'M12'];
  const activeTps = tps.filter(t => !!patient.timepoints[t]);
  
  const sbpTrend = activeTps.map(t => patient.timepoints[t]!.vitals.sbpAvg);
  const dbpTrend = activeTps.map(t => patient.timepoints[t]!.vitals.dbpAvg);
  const lvefTrend = activeTps.map(t => patient.timepoints[t]!.echo.lvef);
  const glsTrend = activeTps.map(t => Math.abs(patient.timepoints[t]!.echo.gls));

  const hemodynamicTrendOption = getLineTrendOption(
    'Longitudinal BP and Cardiac Contractility Trajectory',
    activeTps,
    [
      { name: 'Systolic BP (mmHg)', data: sbpTrend, color: '#ef4444' },
      { name: 'Diastolic BP (mmHg)', data: dbpTrend, color: '#f59e0b' },
      { name: 'Ejection Fraction (%)', data: lvefTrend, color: '#10b981' }
    ],
    'Value',
    darkMode
  );

  return (
    <div className="space-y-6">
      {/* Visual Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-2">
          <EChart option={lvefOption} style={{ height: '240px' }} />
          <div className="text-center text-xs text-slate-400 mt-1">
            Status: <RiskBadge status="" label={record.echo.lvefCategory} />
          </div>
        </div>
        <div className="border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-2">
          <EChart option={glsOption} style={{ height: '240px' }} />
          <div className="text-center text-xs text-slate-400 mt-1">
            Status: <RiskBadge status="" label={record.echo.glsCategory} />
          </div>
        </div>
        <div className="p-2">
          <EChart option={bpOption} style={{ height: '240px' }} />
          <div className="text-center text-xs text-slate-400 mt-1">
            Status: <RiskBadge status="" label={record.vitals.bpCategory} />
          </div>
        </div>
      </div>

      {/* Hemodynamic details & Heart Chamber Illustration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hemodynamic stats */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Activity className="text-blue-500" size={16} />
            Advanced Hemodynamics & Diastology
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="py-2.5 flex justify-between">
              <span className="text-sm text-slate-500">Heart Rate</span>
              <span className="text-sm font-semibold">{record.vitals.hr} bpm</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-sm text-slate-500">Pulse Pressure</span>
              <span className="text-sm font-semibold">{record.vitals.pulsePressure} mmHg</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-sm text-slate-500">Mean Arterial Pressure (MAP)</span>
              <span className="text-sm font-semibold">{record.vitals.map.toFixed(1)} mmHg</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-sm text-slate-500">Mitral E/A Ratio</span>
              <span className="text-sm font-semibold">
                {record.echo.eaRatio.toFixed(2)}{' '}
                <RiskBadge status="" label={record.echo.eaRatio < 0.8 ? 'Impaired' : 'Normal'} />
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-sm text-slate-500">E/e' Ratio (LV Fill Pressure)</span>
              <span className="text-sm font-semibold">
                {record.echo.eePrimeRatio.toFixed(1)}{' '}
                <RiskBadge status="" label={record.echo.eePrimeRatio > 14 ? 'Elevated' : 'Normal'} />
              </span>
            </div>
          </div>
        </div>

        {/* Heart Chamber Illustration Placeholder */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Heart className="text-rose-500 animate-pulse" size={16} />
              Left Ventricle Chamber Outline
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Vector outline representing subclinical strain in LV walls.
            </p>
          </div>

          <div className="flex justify-center items-center py-4">
            {/* Highly customized clean diagnostic Heart chamber outline SVG */}
            <svg width="150" height="150" viewBox="0 0 100 100" className="text-slate-300 dark:text-slate-700">
              {/* Left Ventricle Wall (Outer thicker curve) */}
              <path 
                d="M50,15 C80,-5 98,25 65,70 C58,80 52,88 50,90 C48,88 42,80 35,70 C2,25 20,-5 50,15 Z" 
                fill="none" 
                stroke={darkMode ? '#475569' : '#cbd5e1'} 
                strokeWidth="4" 
              />
              
              {/* Internal chambers septum separator line */}
              <path 
                d="M50,22 L50,88" 
                stroke={darkMode ? '#475569' : '#cbd5e1'} 
                strokeWidth="3.5" 
                strokeDasharray="2,2"
              />

              {/* LV highlight showing stress region */}
              <path 
                d="M50,55 C44,65 38,72 36,75" 
                fill="none" 
                stroke={Math.abs(record.echo.gls) < 18 ? '#ef4444' : '#10b981'} 
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* Labels */}
              <text x="25" y="42" fill={darkMode ? '#94a3b8' : '#64748b'} fontSize="6" fontWeight="bold">RA</text>
              <text x="65" y="42" fill={darkMode ? '#94a3b8' : '#64748b'} fontSize="6" fontWeight="bold">LA</text>
              <text x="25" y="65" fill={darkMode ? '#94a3b8' : '#64748b'} fontSize="6" fontWeight="bold">RV</text>
              <text x="63" y="65" fill={darkMode ? '#3b82f6' : '#2563eb'} fontSize="7" fontWeight="bold">LV</text>
            </svg>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900 text-[10px] text-slate-400">
            <strong>Diagnostic Note:</strong> Strain anomalies are mapped relative to the absolute GLS threshold (|GLS| &gt; 20%). Region highlight colors correspond to regional contraction values.
          </div>
        </div>

        {/* Longitudinal Trajectory Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <EChart option={hemodynamicTrendOption} style={{ height: '240px' }} />
        </div>
      </div>
    </div>
  );
};

export default Cardiovascular;
