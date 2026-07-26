import React, { useState, useMemo } from 'react';
import { BarChart, Grid } from 'lucide-react';
import { PatientProfile, PatientRecord } from '../../types';
import EChart from '../../components/charts/EChart';
import { getBarOption } from '../../components/charts/EChartTemplates';

interface ClinicalAnalyticsProps {
  cohortList: PatientProfile[];
  darkMode: boolean;
}

type MetricType = 'bp' | 'bmi' | 'hba1c' | 'lvef' | 'ldl' | 'hr';
type GroupBy = 'gender' | 'district' | 'timepoint' | 'group';

export const ClinicalAnalytics: React.FC<ClinicalAnalyticsProps> = ({ cohortList, darkMode }) => {
  const [metric, setMetric] = useState<MetricType>('bmi');
  const [groupBy, setGroupBy] = useState<GroupBy>('gender');

  // Compute grouped data
  const chartOption = useMemo(() => {
    // 1. Gather all records with timepoints
    const allRecords: {
      patient: PatientProfile;
      record: PatientRecord;
    }[] = [];

    cohortList.forEach(p => {
      Object.keys(p.timepoints).forEach(tp => {
        const r = p.timepoints[tp as 'BL' | 'M3' | 'M6' | 'M12'];
        if (r) {
          allRecords.push({ patient: p, record: r });
        }
      });
    });

    // 2. Extract values based on selected metric
    const getMetricVal = (item: typeof allRecords[0]) => {
      const r = item.record;
      switch (metric) {
        case 'bmi': return r.anthropometry.bmi;
        case 'lvef': return r.echo.lvef;
        case 'hba1c': return r.labs.hba1c;
        case 'ldl': return r.labs.ldl;
        case 'hr': return r.vitals.hr;
        case 'bp': return r.vitals.sbpAvg; // default to SBP for BP
        default: return 0;
      }
    };

    const getGroupKey = (item: typeof allRecords[0]) => {
      const p = item.patient;
      const r = item.record;
      switch (groupBy) {
        case 'gender': return p.gender === 'M' ? 'Male' : 'Female';
        case 'district': return p.district;
        case 'timepoint': return r.timepoint;
        case 'group': return p.group;
        default: return '';
      }
    };

    // 3. Aggregate averages
    const sums: { [key: string]: number } = {};
    const counts: { [key: string]: number } = {};

    allRecords.forEach(item => {
      const key = getGroupKey(item);
      const val = getMetricVal(item);
      sums[key] = (sums[key] || 0) + val;
      counts[key] = (counts[key] || 0) + 1;
    });

    const categories = Object.keys(sums).sort();
    const averages = categories.map(cat => sums[cat] / counts[cat]);

    let metricLabel = '';
    let unit = '';
    switch (metric) {
      case 'bmi': metricLabel = 'Body Mass Index'; unit = 'kg/m²'; break;
      case 'lvef': metricLabel = 'Ejection Fraction'; unit = '%'; break;
      case 'hba1c': metricLabel = 'HbA1c'; unit = '%'; break;
      case 'ldl': metricLabel = 'LDL-Cholesterol'; unit = 'mg/dL'; break;
      case 'hr': metricLabel = 'Heart Rate'; unit = 'bpm'; break;
      case 'bp': metricLabel = 'Systolic BP (Mean)'; unit = 'mmHg'; break;
    }

    let groupLabel = '';
    switch (groupBy) {
      case 'gender': groupLabel = 'Gender'; break;
      case 'district': groupLabel = 'District (Kerala)'; break;
      case 'timepoint': groupLabel = 'Study Timepoint'; break;
      case 'group': groupLabel = 'Cohort Arm'; break;
    }

    return getBarOption(
      `Mean ${metricLabel} grouped by ${groupLabel}`,
      categories,
      [
        { name: `Average ${metricLabel}`, data: averages, color: '#3b82f6' }
      ],
      unit,
      darkMode
    );
  }, [cohortList, metric, groupBy, darkMode]);

  return (
    <div className="space-y-6">
      {/* Dynamic Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid className="text-slate-400" size={16} />
          <span className="text-xs font-semibold text-slate-500 uppercase">Pivot Explorer</span>
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Clinical Metric:</span>
            <select
              value={metric}
              onChange={e => setMetric(e.target.value as MetricType)}
              className="bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 font-semibold"
            >
              <option value="bmi">Body Mass Index (BMI)</option>
              <option value="bp">Blood Pressure (SBP)</option>
              <option value="lvef">Ejection Fraction (LVEF)</option>
              <option value="hba1c">HbA1c Glycemia</option>
              <option value="ldl">LDL-Cholesterol</option>
              <option value="hr">Heart Rate (HR)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Group By:</span>
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value as GroupBy)}
              className="bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 font-semibold"
            >
              <option value="gender">Participant Gender</option>
              <option value="district">District (Kerala)</option>
              <option value="timepoint">Study Timepoint (Visit)</option>
              <option value="group">Study Cohort Arm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart Output */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="text-blue-500" size={16} />
          <span className="text-xs font-semibold text-slate-500 uppercase">Pivot Chart Display</span>
        </div>
        <EChart option={chartOption} style={{ height: '360px' }} />
      </div>
    </div>
  );
};

export default ClinicalAnalytics;
