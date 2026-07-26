import React, { useState, useMemo } from 'react';
import { Shield, RefreshCw, Activity, BarChart3 } from 'lucide-react';
import { PatientProfile, PatientRecord } from '../../types';
import EChart from '../../components/charts/EChart';
import { getBarOption, getScatterOption } from '../../components/charts/EChartTemplates';

interface MolecularAnalyticsProps {
  cohortList: PatientProfile[];
  darkMode: boolean;
}

export const MolecularAnalytics: React.FC<MolecularAnalyticsProps> = ({ cohortList, darkMode }) => {
  const [subTab, setSubTab] = useState<'genomics' | 'epigenetics' | 'oxidative' | 'shannon'>('genomics');

  const activeRecords = useMemo(() => {
    return cohortList
      .map(p => p.timepoints.BL) // Baseline multi-omics data focus
      .filter((r): r is PatientRecord => !!r);
  }, [cohortList]);

  // 1. Genomics Tab options
  const genomicsOption = useMemo(() => {
    // Score distributions
    const scoreBins = Array(17).fill(0);
    activeRecords.forEach(r => {
      scoreBins[r.genomics.totalScore] += 1;
    });

    return getBarOption(
      'Distribution of Genomic Risk Scores (0-16 pts) at Baseline',
      scoreBins.map((_, i) => `${i} pts`),
      [
        { name: 'Patient Count', data: scoreBins, color: '#3b82f6' }
      ],
      'Count',
      darkMode
    );
  }, [activeRecords, darkMode]);

  // 2. Epigenetics Tab options: Methylation vs. Expression Scatter
  const epigeneticsOption = useMemo(() => {
    const dataPoints = activeRecords.map(r => [
      r.epigenetics.nrf2Meth,
      r.epigenetics.nrf2Exp
    ] as [number, number]);

    return getScatterOption(
      'NRF2 Promoter Methylation (%) vs. qPCR Expression fold-change',
      'NRF2 Methylation (%)',
      'qPCR fold-change',
      dataPoints,
      'Baseline Patients',
      darkMode
    );
  }, [activeRecords, darkMode]);

  // 3. Oxidative Stress Tab options: MDA vs. SOD Scatter
  const oxidativeOption = useMemo(() => {
    const dataPoints = activeRecords.map(r => [
      r.oxidativeStress.mda,
      r.oxidativeStress.sod
    ] as [number, number]);

    return getScatterOption(
      'MDA Lipid Peroxidation (umol/L) vs. SOD Antioxidant Activity (U/mL)',
      'MDA (umol/L)',
      'SOD Activity (U/mL)',
      dataPoints,
      'Baseline Patients',
      darkMode
    );
  }, [activeRecords, darkMode]);

  // 4. Shannon J' Codon Entropy Tab options
  const shannonOption = useMemo(() => {
    const families = [
      'Alanine', 'Arginine', 'Asparagine', 'Aspartate', 'Cysteine', 
      'Glutamate', 'Glutamine', 'Glycine', 'Histidine', 'Isoleucine', 
      'Leucine', 'Lysine', 'Methionine', 'Phenylalanine', 'Proline', 
      'Serine', 'Threonine', 'Tryptophan', 'Tyrosine', 'Valine', 'Stop'
    ];

    const sums = Array(21).fill(0);
    activeRecords.forEach(r => {
      families.forEach((fam, idx) => {
        sums[idx] += r.shannonEntropy.families[fam] || 0.8;
      });
    });

    const averages = sums.map(s => s / activeRecords.length);

    return getBarOption(
      'Cohort Average Codon Family Resilience J\' Score',
      families,
      [
        { name: 'Mean J\' Score', data: averages, color: '#10b981' }
      ],
      'Resilience index',
      darkMode
    );
  }, [activeRecords, darkMode]);

  return (
    <div className="space-y-6">
      {/* Sub-tabs Selection */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setSubTab('genomics')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all -mb-px ${
            subTab === 'genomics'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Shield size={14} />
          Genomics
        </button>
        <button
          onClick={() => setSubTab('epigenetics')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all -mb-px ${
            subTab === 'epigenetics'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Activity size={14} />
          Epigenetics
        </button>
        <button
          onClick={() => setSubTab('oxidative')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all -mb-px ${
            subTab === 'oxidative'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <RefreshCw size={14} />
          Oxidative Stress
        </button>
        <button
          onClick={() => setSubTab('shannon')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all -mb-px ${
            subTab === 'shannon'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart3 size={14} />
          Shannon Entropy
        </button>
      </div>

      {/* Render selected chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        {subTab === 'genomics' && <EChart option={genomicsOption} style={{ height: '360px' }} />}
        {subTab === 'epigenetics' && <EChart option={epigeneticsOption} style={{ height: '360px' }} />}
        {subTab === 'oxidative' && <EChart option={oxidativeOption} style={{ height: '360px' }} />}
        {subTab === 'shannon' && <EChart option={shannonOption} style={{ height: '360px' }} />}
      </div>
    </div>
  );
};

export default MolecularAnalytics;
