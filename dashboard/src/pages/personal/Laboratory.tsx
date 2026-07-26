import React from 'react';
import { Layers, Activity, ShieldAlert, Heart } from 'lucide-react';
import { PatientRecord, PatientProfile } from '../../types';
import { RiskBadge } from '../../components/ui/UIComponents';
import EChart from '../../components/charts/EChart';
import { getBarOption, getLineTrendOption } from '../../components/charts/EChartTemplates';

interface LaboratoryProps {
  patient: PatientProfile;
  record: PatientRecord;
  darkMode: boolean;
}

export const Laboratory: React.FC<LaboratoryProps> = ({ patient, record, darkMode }) => {
  // 1. Lipids Bar Chart
  const lipidOption = getBarOption(
    'Current Lipid Fraction Profile (mg/dL)',
    ['TC', 'LDL', 'HDL', 'TG', 'Non-HDL'],
    [
      {
        name: 'Patient Values',
        data: [
          record.labs.tc,
          record.labs.ldl,
          record.labs.hdl,
          record.labs.tg,
          record.labs.nonHdl
        ],
        color: '#3b82f6'
      }
    ],
    'mg/dL',
    darkMode
  );

  // 2. Glycemic Trend Chart across active timepoints
  const tps: ('BL' | 'M3' | 'M6' | 'M12')[] = ['BL', 'M3', 'M6', 'M12'];
  const activeTps = tps.filter(t => !!patient.timepoints[t]);
  
  const fbgTrend = activeTps.map(t => patient.timepoints[t]!.labs.fbg);
  const hba1cTrend = activeTps.map(t => patient.timepoints[t]!.labs.hba1c * 10); // scale up HbA1c slightly for combined visualization

  const diabetesOption = getLineTrendOption(
    'Glycemic Trends (Fasting Glucose mg/dL vs. HbA1c % × 10)',
    activeTps,
    [
      { name: 'Fasting Blood Glucose', data: fbgTrend, color: '#3b82f6' },
      { name: 'HbA1c (%) × 10', data: hba1cTrend, color: '#10b981' }
    ],
    'Values',
    darkMode
  );

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <EChart option={lipidOption} style={{ height: '300px' }} />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <EChart option={diabetesOption} style={{ height: '300px' }} />
        </div>
      </div>

      {/* Lab Groups Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Lipid Ratios */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
            <Heart className="text-blue-500" size={16} />
            Lipid Ratios
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">TC/HDL-C Ratio</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {record.labs.tcHdlRatio.toFixed(2)}{' '}
                <RiskBadge status="" label={record.labs.tcHdlRatio > 5.0 ? 'Elevated' : 'Normal'} />
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">LDL/HDL-C Ratio</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {record.labs.ldlHdlRatio.toFixed(2)}{' '}
                <RiskBadge status="" label={record.labs.ldlHdlRatio > 3.0 ? 'Elevated' : 'Normal'} />
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Calculated VLDL</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {record.labs.vldl.toFixed(1)} mg/dL
              </span>
            </div>
          </div>
        </div>

        {/* Diabetes Indices */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
            <Activity className="text-emerald-500" size={16} />
            Glycemia & Insulin Resistance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">HbA1c</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {record.labs.hba1c.toFixed(1)}%{' '}
                <RiskBadge status="" label={record.labs.hba1c > 6.5 ? 'Diabetic' : record.labs.hba1c > 5.7 ? 'Pre-diabetic' : 'Normal'} />
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Fasting Glucose</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {record.labs.fbg.toFixed(0)} mg/dL
              </span>
            </div>
            {record.labs.homaIr && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">HOMA-IR Score</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {record.labs.homaIr.toFixed(2)}{' '}
                  <RiskBadge status="" label={record.labs.homaIr > 2.5 ? 'IR Active' : 'Normal'} />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Renal & Hepatic */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
            <Layers className="text-indigo-500" size={16} />
            Renal & Hepatic Profiles
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Creatinine</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {record.labs.creat.toFixed(2)} mg/dL
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">eGFR (CKD-EPI)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {record.labs.egfr.toFixed(0)} mL/min{' '}
                <RiskBadge status="" label={record.labs.egfr < 60 ? 'Impaired' : 'Normal'} />
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">ALT / AST Liver</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {record.labs.alt.toFixed(0)} / {record.labs.ast.toFixed(0)} U/L
              </span>
            </div>
          </div>
        </div>

        {/* Cardiac Biomarkers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
            <ShieldAlert className="text-rose-500" size={16} />
            Myocardial Inflammatory
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">hsCRP (Inflammation)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {record.labs.hsCrp.toFixed(2)} mg/L{' '}
                <RiskBadge status="" label={record.labs.hsCrp > 3.0 ? 'High Risk' : record.labs.hsCrp > 1.0 ? 'Moderate' : 'Healthy'} />
              </span>
            </div>
            {record.labs.ntProBnp && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">NT-proBNP</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {record.labs.ntProBnp.toFixed(0)} pg/mL
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">FABP-NIR</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {record.fabpNir.value.toFixed(1)} ng/mL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Laboratory;
