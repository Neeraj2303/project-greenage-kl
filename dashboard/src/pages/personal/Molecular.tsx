import React from 'react';
import { Shield, Activity, RefreshCw, BarChart2 } from 'lucide-react';
import { PatientRecord, PatientProfile } from '../../types';
import { RiskBadge } from '../../components/ui/UIComponents';

interface MolecularProps {
  patient: PatientProfile;
  record: PatientRecord;
  darkMode: boolean;
}

export const Molecular: React.FC<MolecularProps> = ({ patient, record, darkMode }) => {
  // Helpers for genomics variant display
  const getSNPDetails = (gene: string, val: string) => {
    switch (gene) {
      case 'ace':
        return { name: 'ACE I/D (rs4762)', action: val === 'DD' ? 'High risk, ACE inhibition advised' : 'Standard cardiovascular guidelines' };
      case 'pcsk9':
        return { name: 'PCSK9 (rs562556)', action: val === 'GG' ? 'Elevated LDL recycling, PCSK9 tracking' : 'Standard lipid management' };
      case 'hmgcoa':
        return { name: 'HMGCoA Reductase (rs17238484)', action: val === 'TT' ? 'Reduced statin response, alternative lipids therapy' : 'Normal statin metabolism' };
      case 'mthfr':
        return { name: 'MTHFR C677T (rs1801133)', action: val === 'TT' ? 'Methylation block, active folate supplemented' : 'Standard folate intake' };
      case 'tcf7l2':
        return { name: 'TCF7L2 (rs7903146)', action: val === 'TT' ? 'High DM risk, strict carb management' : 'Standard dietary balance' };
      case 'fto':
        return { name: 'FTO rs9939609', action: val === 'AA' ? 'High adiposity index, physical activity essential' : 'Standard physical activity' };
      case 'pparg':
        return { name: 'PPARG Pro12Ala', action: val === 'CC' ? 'Elevated metabolic syndrome risk' : 'Standard monitoring' };
      case 'nrf2':
        return { name: 'NRF2 promoter (rs6706649)', action: val === 'TT' ? 'Depressed antioxidant expression, sulforaphane advised' : 'Normal antioxidant capacity' };
      default:
        return { name: gene.toUpperCase(), action: '—' };
    }
  };

  const getResilienceClass = (j: number) => {
    if (j >= 0.90) return { label: 'High Resilience', color: 'bg-emerald-500', text: 'text-emerald-500' };
    if (j >= 0.82) return { label: 'Moderate Resilience', color: 'bg-amber-500', text: 'text-amber-500' };
    return { label: 'Low Resilience (Trigger Active)', color: 'bg-rose-500', text: 'text-rose-500' };
  };

  const resilience = getResilienceClass(record.shannonEntropy.compositeJ);

  return (
    <div className="space-y-6">
      {/* 4 Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Genomics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Shield className="text-blue-500" size={18} />
              Genomics Risk Profiling
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              8-Candidate Variant Panel scoring (0 to 16 risk points)
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-900">
                <span className="text-xs text-slate-400">Genomic Risk Score</span>
                <div className="text-xl font-bold mt-0.5">{record.genomics.totalScore} <span className="text-xs text-slate-400">/ 16</span></div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-900">
                <span className="text-xs text-slate-400">Classification</span>
                <div className="mt-0.5"><RiskBadge status="" label={record.genomics.riskTertile} /></div>
              </div>
            </div>

            <div className="max-h-[220px] overflow-y-auto pr-2 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {(['ace', 'pcsk9', 'hmgcoa', 'mthfr', 'tcf7l2', 'fto', 'pparg', 'nrf2'] as const).map(gene => {
                const val = record.genomics[gene];
                const info = getSNPDetails(gene, val);
                return (
                  <div key={gene} className="py-2 flex justify-between gap-4">
                    <span className="text-slate-500 font-medium shrink-0">{info.name}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{val}</span>
                    <span className="text-[10px] text-slate-400 text-right truncate max-w-[200px]" title={info.action}>{info.action}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Epigenetics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
            <Activity className="text-indigo-500" size={18} />
            Epigenetic DNA Methylation & Pathways
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Global and gene-specific promoter methylation profiles
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 flex flex-col justify-between h-[100px]">
              <span className="text-xs text-slate-500">Global 5-mC Methylation</span>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{record.epigenetics.fiveMc.toFixed(2)} %</div>
              <span className="text-[10px] text-slate-400">Baseline reference: 3.2%</span>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 flex flex-col justify-between h-[100px]">
              <span className="text-xs text-slate-500">NRF2 Promoter Methylation</span>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{record.epigenetics.nrf2Meth.toFixed(1)} %</div>
              <span className="text-[10px] text-slate-400">Lower = better NRF2 pathway activation</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 flex flex-col justify-between h-[100px]">
              <span className="text-xs text-slate-500">qPCR NRF2 Expression</span>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{record.epigenetics.nrf2Exp.toFixed(2)} fold</div>
              <span className="text-[10px] text-slate-400">Target baseline: &gt;1.5 fold</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 flex flex-col justify-between h-[100px]">
              <span className="text-xs text-slate-500">Nuclear Translocation</span>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{record.epigenetics.nrf2Nuc.toFixed(1)} %</div>
              <span className="text-[10px] text-slate-400">Active NRF2 in nucleus</span>
            </div>
          </div>
        </div>

        {/* 3. Oxidative Stress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
            <RefreshCw className="text-emerald-500" size={18} />
            Antioxidant Defense & Oxidative Burden
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            ROS lipid peroxidation and enzyme activity ratios
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900">
                <span className="text-[10px] text-slate-400 uppercase">MDA (Malondialdehyde)</span>
                <div className="text-base font-bold mt-0.5">{record.oxidativeStress.mda.toFixed(2)} umol/L</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900">
                <span className="text-[10px] text-slate-400 uppercase">SOD Activity</span>
                <div className="text-base font-bold mt-0.5">{record.oxidativeStress.sod.toFixed(1)} U/mL</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900">
                <span className="text-[10px] text-slate-400 uppercase">GSH/GSSG Ratio</span>
                <div className="text-base font-bold mt-0.5">{record.oxidativeStress.gshGssgRatio.toFixed(1)}</div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Oxidative Stress Index (OSI)</span>
                <p className="text-[10px] text-slate-400">Formula: (MDA / SOD) × 100</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold">{record.oxidativeStress.oxidativeStressIndex.toFixed(1)}%</span>
                <RiskBadge status="" label={record.oxidativeStress.oxidativeStressIndex > 35 ? 'Elevated Burden' : 'Stable Capacity'} />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Shannon Entropy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
              <BarChart2 className="text-rose-500" size={18} />
              Shannon Codon Entropy & Resilience
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Biological sequence stability and thermodynamic entropy index (J')
            </p>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 mb-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs text-slate-500 font-semibold uppercase">Composite Mean J'</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{record.shannonEntropy.compositeJ.toFixed(3)}</span>
                  <span className="text-xs text-slate-400">/ 1.0</span>
                </div>
              </div>
              
              {/* Visual meter */}
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                {/* Visual marker */}
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${resilience.color}`}
                  style={{ width: `${record.shannonEntropy.compositeJ * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                <span>0.70 Low</span>
                <span>0.82 Moderate</span>
                <span>0.90 High</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Classification</span>
              <span className={`font-bold ${resilience.text}`}>{resilience.label}</span>
            </div>
            <div className="flex justify-between items-center text-xs mt-2">
              <span className="text-slate-500">Low Entropy Amino Acid Families</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {record.shannonEntropy.lowFamiliesCount} / 21
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Molecular;
