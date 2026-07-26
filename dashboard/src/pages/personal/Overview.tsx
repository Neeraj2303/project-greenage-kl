import React from 'react';
import { Activity, ShieldAlert, Heart, Percent, Award, Eye, FileText, Zap } from 'lucide-react';
import { PatientRecord, PatientProfile } from '../../types';
import { MetricCard, RiskBadge } from '../../components/ui/UIComponents';
import EChart from '../../components/charts/EChart';
import { getRadarOption } from '../../components/charts/EChartTemplates';

interface OverviewProps {
  patient: PatientProfile;
  record: PatientRecord;
  darkMode: boolean;
}

export const Overview: React.FC<OverviewProps> = ({ patient, record, darkMode }) => {
  // Build a summary comparison radar chart of this patient vs. average test cohort
  const radarIndicators = [
    { name: 'Health Score', max: 100 },
    { name: 'Compliance', max: 100 },
    { name: 'LVEF (Heart)', max: 80 },
    { name: 'Antioxidant (SOD)', max: 20 },
    { name: 'Resilience (J\')', max: 1 }
  ];

  const radarData = [
    {
      name: patient.name,
      value: [
        record.overallHealthScore,
        record.compliance.overallPct,
        record.echo.lvef,
        record.oxidativeStress.sod,
        record.shannonEntropy.compositeJ
      ]
    },
    {
      name: 'Cohort Baseline Avg',
      value: [72, 0, 56, 12.4, 0.81]
    }
  ];

  const radarOption = getRadarOption(
    'Multi-Omics Wellness Fingerprint',
    radarIndicators,
    radarData,
    darkMode
  );

  // Generate automated clinical health narrative summary based on values
  const getClinicalSummary = () => {
    const isTest = patient.group === 'TEST';
    const compliance = record.compliance.overallPct;
    const bp = record.vitals.bpCategory;
    const lvef = record.echo.lvef;
    const genomics = record.genomics.riskTertile;
    const shannonTrigger = record.shannonEntropy.lowFamiliesCount >= 3;

    let narrative = `Participant ${patient.pid} is enrolled in the ${patient.group} arm at timepoint ${record.timepoint}. `;
    
    if (bp.includes('Hypertension')) {
      narrative += `Cardiovascular assessment reveals active ${bp} (${Math.round(record.vitals.sbpAvg)}/${Math.round(record.vitals.dbpAvg)} mmHg) with Mean Arterial Pressure of ${record.vitals.map.toFixed(1)} mmHg. `;
    } else {
      narrative += `Cardiovascular assessment indicates controlled/normal blood pressure. `;
    }

    if (lvef < 50) {
      narrative += `Echocardiography shows mildly depressed left ventricular systolic function (LVEF ${lvef.toFixed(1)}%), indicating subclinical myocardial strain (GLS ${record.echo.gls.toFixed(1)}%). `;
    } else {
      narrative += `Left ventricular systolic function is preserved (LVEF ${lvef.toFixed(1)}%, GLS ${record.echo.gls.toFixed(1)}%). `;
    }

    narrative += `Genomically, the participant exhibits a ${genomics} with a score of ${record.genomics.totalScore}/16. `;

    if (isTest) {
      narrative += `Intervention compliance is logged at ${compliance.toFixed(1)}% over the active fortnights. `;
      if (compliance > 85) {
        narrative += `Excellent supplement adherence has correlated with stabilized biochemical biomarkers, including an improved oxidative index (OSI ${record.oxidativeStress.oxidativeStressIndex.toFixed(1)}%) and high NRF2 pathway activation. `;
      } else {
        narrative += `Adherence tracking indicates room for counseling to optimize dietary epigenetic modulation. `;
      }
    } else {
      narrative += `As a control subject, standard diet guidelines are followed. `;
    }

    if (shannonTrigger) {
      narrative += `Biological resilience calculation alerts a therapeutic trigger due to ${record.shannonEntropy.lowFamiliesCount} amino acid codon families showing depleted Shannon J' entropy. Dose escalation or targeted folate support is indicated.`;
    } else {
      narrative += `Biological resilience metrics remain stable with a composite mean J' score of ${record.shannonEntropy.compositeJ.toFixed(2)}.`;
    }

    return narrative;
  };

  return (
    <div className="space-y-6">
      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Health Score"
          value={record.overallHealthScore}
          unit="/100"
          status={record.overallHealthScore >= 80 ? 'healthy' : record.overallHealthScore >= 60 ? 'warning' : 'critical'}
          icon={Award}
          subtext="Composite wellness index"
        />
        <MetricCard
          title="Cardiovascular Risk"
          value={record.vitals.bpCategory.split(' ')[0]}
          status={record.vitals.bpCategory.includes('Normal') ? 'healthy' : record.vitals.bpCategory.includes('Stage 2') ? 'critical' : 'warning'}
          icon={Heart}
          subtext={`BP: ${Math.round(record.vitals.sbpAvg)}/${Math.round(record.vitals.dbpAvg)} mmHg`}
        />
        <MetricCard
          title="BMI (Asian Specific)"
          value={record.anthropometry.bmi.toFixed(1)}
          unit="kg/m²"
          status={record.anthropometry.bmi < 23 ? 'healthy' : record.anthropometry.bmi < 25 ? 'warning' : 'critical'}
          icon={Activity}
          subtext={record.anthropometry.bmiCategory}
        />
        <MetricCard
          title="Ejection Fraction (LVEF)"
          value={record.echo.lvef.toFixed(0)}
          unit="%"
          status={record.echo.lvef >= 55 ? 'healthy' : record.echo.lvef >= 40 ? 'warning' : 'critical'}
          icon={Zap}
          subtext={record.echo.lvefCategory.split(' ')[0]}
        />
        <MetricCard
          title="FABP-NIR Spectroscopy"
          value={record.fabpNir.value.toFixed(1)}
          unit="ng/mL"
          status={record.fabpNir.value < 2 ? 'healthy' : record.fabpNir.value < 6 ? 'warning' : 'critical'}
          icon={Eye}
          subtext={record.fabpNir.category.split(' ')[0]}
        />
        <MetricCard
          title="Genomic Risk Points"
          value={record.genomics.totalScore}
          unit="/16"
          status={record.genomics.totalScore <= 5 ? 'healthy' : record.genomics.totalScore <= 10 ? 'warning' : 'critical'}
          icon={ShieldAlert}
          subtext={record.genomics.riskTertile.split(' ')[0]}
        />
        <MetricCard
          title="Microgreen Compliance"
          value={patient.group === 'CTRL' ? 'N/A' : `${record.compliance.overallPct.toFixed(1)}%`}
          status={patient.group === 'CTRL' ? 'diagnostic' : record.compliance.overallPct >= 85 ? 'healthy' : record.compliance.overallPct >= 70 ? 'warning' : 'critical'}
          icon={Percent}
          subtext={patient.group === 'CTRL' ? 'Control Arm' : 'Intervention Adherence'}
        />
        <MetricCard
          title="Biological J' Resilience"
          value={record.shannonEntropy.compositeJ.toFixed(2)}
          status={record.shannonEntropy.lowFamiliesCount < 3 ? 'healthy' : 'critical'}
          icon={FileText}
          subtext={`${record.shannonEntropy.lowFamiliesCount} Low Entropy Families`}
        />
      </div>

      {/* Narrative & Visual Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
              <FileText className="text-blue-500" size={18} />
              Clinical Health Narrative Summary
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-line">
              {getClinicalSummary()}
            </p>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 flex justify-between items-center text-xs text-slate-400">
            <span>Automatic synthesis model: MIKRA-EPIGEN-2026-v1</span>
            <span className="font-mono">{record.demographics.code}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <EChart option={radarOption} style={{ height: '320px' }} />
        </div>
      </div>
    </div>
  );
};

export default Overview;
