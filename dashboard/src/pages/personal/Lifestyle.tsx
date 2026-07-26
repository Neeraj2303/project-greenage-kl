import React from 'react';
import { User, Activity, Dumbbell, Award } from 'lucide-react';
import { PatientRecord, PatientProfile } from '../../types';
import EChart from '../../components/charts/EChart';
import { getRadarOption } from '../../components/charts/EChartTemplates';

interface LifestyleProps {
  patient: PatientProfile;
  record: PatientRecord;
  darkMode: boolean;
}

export const Lifestyle: React.FC<LifestyleProps> = ({ patient, record, darkMode }) => {
  // 1. Generate lifestyle variables deterministically based on patient ID & group
  // Test group generally has healthier lifestyle indicators over time (dietary improvements, physical activity)
  const isTest = patient.group === 'TEST';
  const isBaseline = record.timepoint === 'BL';

  const exerciseScore = isTest ? (isBaseline ? 5.5 : 7.8) : 5.2;
  const dietScore = isTest ? (isBaseline ? 6.0 : 8.5) : 5.8;
  const stressScore = isTest ? (isBaseline ? 6.5 : 4.2) : 6.8; // lower is better
  const sleepScore = isTest ? (isBaseline ? 5.8 : 7.5) : 6.0;
  const tobaccoScore = isTest ? (isBaseline ? 1.5 : 0.5) : 1.8; // lower consumption is better
  const alcoholScore = isTest ? (isBaseline ? 2.0 : 1.0) : 2.2;

  const radarIndicators = [
    { name: 'Physical Exercise', max: 10 },
    { name: 'Dietary Quality', max: 10 },
    { name: 'Stress Management', max: 10 },
    { name: 'Restful Sleep', max: 10 },
    { name: 'Tobacco Avoidance', max: 10 },
    { name: 'Alcohol Control', max: 10 }
  ];

  // Map values: for Stress, Tobacco, Alcohol, we invert the raw score to represent "healthiness" (i.e. 10 - score)
  const radarData = [
    {
      name: 'Current Visit',
      value: [
        exerciseScore,
        dietScore,
        10 - stressScore,
        sleepScore,
        10 - tobaccoScore,
        10 - alcoholScore
      ]
    },
    {
      name: 'Cohort Baseline Avg',
      value: [5.2, 5.8, 4.0, 5.5, 8.2, 7.8]
    }
  ];

  const lifestyleRadarOption = getRadarOption(
    'Lifestyle Index Profile',
    radarIndicators,
    radarData,
    darkMode
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <EChart option={lifestyleRadarOption} style={{ height: '360px' }} />
        </div>

        {/* Body Composition Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Dumbbell className="text-blue-500 animate-bounce" size={18} />
              Body Composition Profile
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Bioelectrical Impedance and anthropometric analysis
            </p>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-500">Height / Weight</span>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {record.anthropometry.height.toFixed(0)} cm / {record.anthropometry.weight.toFixed(1)} kg
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-500">Body Mass Index (BMI)</span>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {record.anthropometry.bmi.toFixed(1)} kg/m²
                </span>
              </div>

              {record.anthropometry.bodyFat && (
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Estimated Body Fat</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {record.anthropometry.bodyFat.toFixed(1)} %
                  </span>
                </div>
              )}

              {record.anthropometry.muscleMass && (
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Skeletal Muscle Mass</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {record.anthropometry.muscleMass.toFixed(1)} kg
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Waist-Hip Ratio (WHR)</span>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {record.anthropometry.whr.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-900 text-xs text-slate-400 flex items-start gap-2 mt-4">
            <Award className="text-emerald-500 shrink-0 mt-0.5" size={14} />
            <span>
              Consistent physical training and a high-fiber plant-based diet improve skeletal muscle indexing and reduce waist adiposity.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Lifestyle;
