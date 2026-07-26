import React, { useState, useMemo } from 'react';
import { MapPin, Info, Users } from 'lucide-react';
import { PatientProfile, PatientRecord } from '../../types';
import KeralaMap from '../../components/maps/KeralaMap';
import { RiskBadge } from '../../components/ui/UIComponents';

interface DistrictAnalyticsProps {
  cohortList: PatientProfile[];
  darkMode: boolean;
}

type MapMetric = 'avgRisk' | 'htn' | 'fabp' | 'obesity' | 'compliance' | 'population';

export const DistrictAnalytics: React.FC<DistrictAnalyticsProps> = ({ cohortList, darkMode }) => {
  const [metric, setMetric] = useState<MapMetric>('avgRisk');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kottayam');

  // Compute district statistics
  const districtStats = useMemo(() => {
    const records = cohortList.filter(p => p.district === selectedDistrict);
    
    if (records.length === 0) return null;

    let riskSum = 0;
    let htnCount = 0;
    let obesityCount = 0;
    let complianceSum = 0;
    let complianceCount = 0;
    let count = records.length;

    records.forEach(p => {
      const bl = p.timepoints.BL!;
      if (!bl) return;

      riskSum += bl.genomics.totalScore;
      if (bl.vitals.sbpAvg >= 130 || bl.vitals.dbpAvg >= 80) htnCount++;
      if (bl.anthropometry.bmi >= 25) obesityCount++;
      if (p.group === 'TEST') {
        complianceSum += bl.compliance.overallPct;
        complianceCount++;
      }
    });

    return {
      name: selectedDistrict,
      count,
      avgRisk: riskSum / count,
      htnRate: (htnCount / count) * 100,
      obesityRate: (obesityCount / count) * 100,
      complianceRate: complianceCount > 0 ? (complianceSum / complianceCount) : 0,
      patients: records.map(p => ({ pid: p.pid, age: p.age, gender: p.gender, group: p.group }))
    };
  }, [cohortList, selectedDistrict]);

  return (
    <div className="space-y-6">
      {/* Metric Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="text-slate-400" size={16} />
          <span className="text-xs font-semibold text-slate-500 uppercase">Map Overlay Selection</span>
        </div>
        
        <div className="flex gap-2 text-xs font-medium">
          {(['avgRisk', 'htn', 'fabp', 'obesity', 'compliance', 'population'] as MapMetric[]).map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                metric === m
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {m === 'avgRisk' && 'Genomic Risk'}
              {m === 'htn' && 'Hypertension'}
              {m === 'fabp' && 'FABP-NIR'}
              {m === 'obesity' && 'Obesity'}
              {m === 'compliance' && 'Supplement Adherence'}
              {m === 'population' && 'Sample Volume'}
            </button>
          ))}
        </div>
      </div>

      {/* Map and Details Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-2">
          <KeralaMap
            metric={metric}
            cohort={cohortList}
            onSelectDistrict={(d) => setSelectedDistrict(d)}
          />
        </div>

        {/* Inspector Detail Column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Info className="text-blue-500" size={18} />
              District Focus Inspector
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Click on a district polygon on the map to inspect cohort metrics.
            </p>

            {districtStats ? (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{districtStats.name} District</span>
                  <span className="text-xs font-semibold text-slate-400">{districtStats.count} Enrolled Cases</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mean Genomic Risk</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{districtStats.avgRisk.toFixed(1)} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hypertension Rate (Stage 1+)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{districtStats.htnRate.toFixed(1)} %</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Obesity Rate (BMI &gt;= 25)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{districtStats.obesityRate.toFixed(1)} %</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mean Supplement Compliance</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{districtStats.complianceRate.toFixed(1)} %</span>
                  </div>
                </div>

                {/* Patient roster from this district */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Participant Roster</span>
                  <div className="max-h-[140px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1 text-xs">
                    {districtStats.patients.map(p => (
                      <div key={p.pid} className="py-1.5 flex justify-between">
                        <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">{p.pid}</span>
                        <span className="text-slate-500 text-xs">{p.age} yrs / {p.gender}</span>
                        <span className={`text-[10px] px-2 rounded-full font-bold ${
                          p.group === 'TEST' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>{p.group}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 py-8 italic">
                Select a district on the map or click boundaries to retrieve data.
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900 text-[10px] text-slate-400 flex items-start gap-2 mt-6">
            <Users className="text-blue-500 shrink-0 mt-0.5" size={14} />
            <span>
              Geospatial maps enable epidemiology researchers to locate hotspots of high risk alleles and target public health intervention campaigns.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DistrictAnalytics;
