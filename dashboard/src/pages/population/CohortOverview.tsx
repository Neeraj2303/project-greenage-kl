import React from 'react';
import { Users, CheckCircle, Percent, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { PatientProfile } from '../../types';
import { getCohortStats } from '../../services/mockData';
import { MetricCard } from '../../components/ui/UIComponents';
import EChart from '../../components/charts/EChart';
import { getBarOption } from '../../components/charts/EChartTemplates';

interface CohortOverviewProps {
  cohortList: PatientProfile[];
  darkMode: boolean;
}

export const CohortOverview: React.FC<CohortOverviewProps> = ({ cohortList, darkMode }) => {
  const stats = getCohortStats(cohortList, 'BL');

  // Calculate cohort completion rates
  const total = cohortList.length;
  const completedM12 = cohortList.filter(p => p.currentCompletedTimepoint === 'M12').length;
  const dropouts = cohortList.filter(p => p.currentCompletedTimepoint === 'M3').length; // dropped out after M3
  const activeTest = cohortList.filter(p => p.group === 'TEST').length;
  const activeCtrl = cohortList.filter(p => p.group === 'CTRL').length;

  const completionRate = ((completedM12) / total) * 100;
  const dropoutRate = (dropouts / total) * 100;

  // 1. Group Counts Chart
  const groupChartOption = getBarOption(
    'Study Group Randomization Count',
    ['TEST Group', 'CTRL Group'],
    [
      { name: 'Enrolled Patients', data: [activeTest, activeCtrl], color: '#3b82f6' }
    ],
    'Patients',
    darkMode
  );

  return (
    <div className="space-y-6">
      {/* 8 Population KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Cohort Enrolled"
          value={stats.totalParticipants}
          unit="patients"
          icon={Users}
          subtext="TEST & CTRL Arms combined"
        />
        <MetricCard
          title="Completed Clinic Visits"
          value={stats.completedVisits}
          unit="visits"
          status="healthy"
          icon={CheckCircle}
          subtext="Total logs in database"
        />
        <MetricCard
          title="Cohort Mean Age"
          value={`${stats.avgAge.toFixed(1)}`}
          unit="yrs"
          icon={Users}
          subtext="Target range: 20-40 years"
        />
        <MetricCard
          title="Cohort Mean BMI"
          value={`${stats.avgBmi.toFixed(1)}`}
          unit="kg/m²"
          status={stats.avgBmi > 25 ? 'warning' : 'healthy'}
          icon={Activity}
          subtext="Target: <23 kg/m²"
        />
        <MetricCard
          title="Mean Ejection Fraction"
          value={`${stats.avgLvef.toFixed(1)}`}
          unit="%"
          status={stats.avgLvef >= 55 ? 'healthy' : 'warning'}
          icon={ShieldCheck}
          subtext="Mean baseline contractility"
        />
        <MetricCard
          title="Mean FABP-NIR"
          value={`${stats.avgFabp.toFixed(1)}`}
          unit="ng/mL"
          status={stats.avgFabp >= 6 ? 'critical' : stats.avgFabp >= 2 ? 'warning' : 'healthy'}
          icon={ShieldCheck}
          subtext="Plasma pre-clinical score"
        />
        <MetricCard
          title="Mean Compliance"
          value={`${stats.avgCompliance.toFixed(1)}%`}
          status={stats.avgCompliance >= 85 ? 'healthy' : 'warning'}
          icon={Percent}
          subtext="Intervention adherence average"
        />
        <MetricCard
          title="Mean Genomic Score"
          value={`${stats.avgRiskScore.toFixed(1)}`}
          unit="pts"
          icon={ShieldCheck}
          subtext="Avg risk alleles counted"
        />
      </div>

      {/* Enrollment & Dropout Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retention Statistics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Percent className="text-blue-500" size={16} />
              Cohort Retention & Adherence Rates
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Study Completion Rate (12 Months)</span>
                  <span>{completionRate.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Dropout / Exit Rate</span>
                  <span>{dropoutRate.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${dropoutRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-900 text-xs text-slate-400 mt-6 flex items-start gap-2">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
            <span>
              Exits are defined as participants who completed Month 3 but failed to attend subsequent follow-up screening visits at Months 6 and 12.
            </span>
          </div>
        </div>

        {/* Study Group Count Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <EChart option={groupChartOption} style={{ height: '240px' }} />
        </div>
      </div>
    </div>
  );
};

export default CohortOverview;
