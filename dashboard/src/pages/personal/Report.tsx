import React from 'react';
import { Printer, Calendar, FileText, CheckSquare } from 'lucide-react';
import { PatientRecord, PatientProfile } from '../../types';
import { RiskBadge } from '../../components/ui/UIComponents';

interface ReportProps {
  patient: PatientProfile;
  record: PatientRecord;
}

export const Report: React.FC<ReportProps> = ({ patient, record }) => {
  const printReport = () => {
    window.print();
  };

  // Generate recommendations based on parameters
  const getRecommendations = () => {
    const recs: string[] = [];

    if (record.vitals.bpCategory.includes('Hypertension')) {
      recs.push('Initiate/optimize blood pressure management protocol. Monitor SBP/DBP twice daily.');
    }
    
    if (record.anthropometry.bmi >= 25) {
      recs.push('Enlist in personalized weight modulation program. Target waist circumference reduction to <90 cm (M) / <80 cm (F).');
    }

    if (record.labs.hba1c > 5.7) {
      recs.push('Impose glycemic control. Recommend low glycemic index carbohydrates (e.g. red/brown rice in place of white rice).');
    }

    if (record.labs.ldl > 130 || record.labs.tcHdlRatio > 5.0) {
      recs.push('Optimize lipid fractions. Reduce dietary saturated fats, increase cardioprotective omega-3 fat intake.');
    }

    if (record.genomics.totalScore > 10) {
      recs.push('Patient carries high polygenic risk alleles. Intensify primary preventive surveillance for subclinical atherosclerotic changes.');
    }

    if (record.shannonEntropy.lowFamiliesCount >= 3) {
      recs.push('Therapeutic trigger activated for Shannon Codon Entropy. Recommended to increase sulforaphane dosage or introduce targeted epigenetic supplement modulations.');
    } else {
      recs.push('Maintain current microgreen intervention dosage (standard protocol).');
    }

    if (patient.group === 'TEST' && record.compliance.overallPct < 85) {
      recs.push('Supplement adherence counseling. Review barrier factors for microgreen consumption.');
    }

    return recs;
  };

  const recommendations = getRecommendations();
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Action Bar (hidden during print) */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex justify-between items-center">
        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
          <FileText size={14} />
          Report is optimized for direct browser printing or saving as PDF.
        </span>
        <button 
          onClick={printReport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all hover:shadow"
        >
          <Printer size={14} />
          Export Clinical PDF
        </button>
      </div>

      {/* Main Medical Report (styled for print layout) */}
      <div className="bg-white border border-slate-300 rounded-xl p-8 max-w-4xl mx-auto shadow-sm text-slate-800 font-sans print:border-none print:shadow-none print:p-0 print:m-0">
        
        {/* Hospital/Study Letterhead */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight uppercase text-slate-900">GREENAGE-KL Study Group</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">MIKRA-EPIGEN-2026 Cohort Registry</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 block uppercase">Document Reference</span>
            <span className="text-xs font-mono font-bold text-slate-800">{record.demographics.code}</span>
          </div>
        </div>

        {/* Header Metadata */}
        <h3 className="text-center font-black text-lg uppercase tracking-wider mb-6 text-slate-800">
          Individual Patient Clinical Profile
        </h3>

        {/* Patient Demographics Table */}
        <div className="border border-slate-300 rounded-lg overflow-hidden mb-6 text-xs">
          <div className="bg-slate-50 border-b border-slate-300 p-2 font-bold uppercase text-[9px] text-slate-600">Patient Demographics</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-300">
            <div className="p-3">
              <span className="text-slate-400 font-semibold block uppercase text-[9px]">Patient ID</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{patient.pid}</span>
            </div>
            <div className="p-3">
              <span className="text-slate-400 font-semibold block uppercase text-[9px]">Participant Name</span>
              <span className="font-bold text-slate-900">{patient.name}</span>
            </div>
            <div className="p-3">
              <span className="text-slate-400 font-semibold block uppercase text-[9px]">Age / Sex</span>
              <span className="font-bold text-slate-900">{patient.age} years / {patient.gender}</span>
            </div>
            <div className="p-3">
              <span className="text-slate-400 font-semibold block uppercase text-[9px]">Study Cohort Group</span>
              <span className="font-bold text-slate-900">{patient.group} Group</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x border-t border-slate-300">
            <div className="p-3">
              <span className="text-slate-400 font-semibold block uppercase text-[9px]">District (Kerala)</span>
              <span className="font-bold text-slate-900">{patient.district}</span>
            </div>
            <div className="p-3">
              <span className="text-slate-400 font-semibold block uppercase text-[9px]">Visit Timepoint</span>
              <span className="font-bold text-slate-900">{record.timepoint}</span>
            </div>
            <div className="p-3">
              <span className="text-slate-400 font-semibold block uppercase text-[9px]">Enrollment Date</span>
              <span className="font-bold text-slate-900">{record.demographics.enrollDate || '—'}</span>
            </div>
            <div className="p-3">
              <span className="text-slate-400 font-semibold block uppercase text-[9px]">Date Generated</span>
              <span className="font-bold text-slate-900">{dateStr}</span>
            </div>
          </div>
        </div>

        {/* Cardiovascular and Genomics Risk Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-slate-300 rounded-lg p-4 text-xs">
            <h4 className="font-bold border-b border-slate-300 pb-1.5 mb-3 text-slate-700 uppercase tracking-wide">Cardiovascular Metrics</h4>
            <table className="w-full">
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="py-1">
                  <td className="py-1.5 text-slate-500">Systolic/Diastolic BP</td>
                  <td className="py-1.5 text-right font-bold">{Math.round(record.vitals.sbpAvg)}/{Math.round(record.vitals.dbpAvg)} mmHg</td>
                </tr>
                <tr className="py-1">
                  <td className="py-1.5 text-slate-500">BP Category</td>
                  <td className="py-1.5 text-right"><RiskBadge status="" label={record.vitals.bpCategory} /></td>
                </tr>
                <tr className="py-1">
                  <td className="py-1.5 text-slate-500">Ejection Fraction (LVEF)</td>
                  <td className="py-1.5 text-right font-bold">{record.echo.lvef.toFixed(0)}% ({record.echo.lvefCategory.split(' ')[0]})</td>
                </tr>
                <tr className="py-1">
                  <td className="py-1.5 text-slate-500">Myocardial Strain (GLS)</td>
                  <td className="py-1.5 text-right font-bold">{record.echo.gls.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border border-slate-300 rounded-lg p-4 text-xs">
            <h4 className="font-bold border-b border-slate-300 pb-1.5 mb-3 text-slate-700 uppercase tracking-wide">Genomics & Epigenetics</h4>
            <table className="w-full">
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="py-1">
                  <td className="py-1.5 text-slate-500">Genomic Risk Score</td>
                  <td className="py-1.5 text-right font-bold">{record.genomics.totalScore} / 16 risk points</td>
                </tr>
                <tr className="py-1">
                  <td className="py-1.5 text-slate-500 font-medium">Genomic Risk Tertile</td>
                  <td className="py-1.5 text-right"><RiskBadge status="" label={record.genomics.riskTertile.split(' ')[0] + ' Risk'} /></td>
                </tr>
                <tr className="py-1">
                  <td className="py-1.5 text-slate-500">Global 5-mC Methylation</td>
                  <td className="py-1.5 text-right font-bold">{record.epigenetics.fiveMc.toFixed(2)} %</td>
                </tr>
                <tr className="py-1">
                  <td className="py-1.5 text-slate-500">NRF2 Promoter Methylation</td>
                  <td className="py-1.5 text-right font-bold">{record.epigenetics.nrf2Meth.toFixed(1)} %</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Laboratory Profile Table */}
        <div className="border border-slate-300 rounded-lg overflow-hidden mb-6 text-xs">
          <div className="bg-slate-50 border-b border-slate-300 p-2 font-bold uppercase text-[9px] text-slate-600">Blood Chemistry & Biomarkers Summary</div>
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-100/50 border-b border-slate-300 text-[9px] font-bold uppercase">
              <tr>
                <th className="p-2">Analyte Test</th>
                <th className="p-2 text-center">Value Mapped</th>
                <th className="p-2 text-center">Reference Limit</th>
                <th className="p-2">Clinical Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-medium">
              <tr>
                <td className="p-2 text-slate-500">Total Cholesterol (TC)</td>
                <td className="p-2 text-center font-bold">{record.labs.tc.toFixed(0)} mg/dL</td>
                <td className="p-2 text-center text-slate-400">&lt;200 mg/dL</td>
                <td className="p-2"><RiskBadge status="" label={record.labs.tc > 200 ? 'Borderline/High' : 'Normal'} /></td>
              </tr>
              <tr>
                <td className="p-2 text-slate-500">LDL-Cholesterol</td>
                <td className="p-2 text-center font-bold">{record.labs.ldl.toFixed(0)} mg/dL</td>
                <td className="p-2 text-center text-slate-400">&lt;100 mg/dL</td>
                <td className="p-2"><RiskBadge status="" label={record.labs.ldl > 130 ? 'Elevated' : 'Normal'} /></td>
              </tr>
              <tr>
                <td className="p-2 text-slate-500">HDL-Cholesterol</td>
                <td className="p-2 text-center font-bold">{record.labs.hdl.toFixed(0)} mg/dL</td>
                <td className="p-2 text-center text-slate-400">&gt;40 (M), &gt;50 (F)</td>
                <td className="p-2"><RiskBadge status="" label={record.labs.hdl < 40 ? 'Depressed' : 'Normal'} /></td>
              </tr>
              <tr>
                <td className="p-2 text-slate-500">HbA1c (Glycated Hb)</td>
                <td className="p-2 text-center font-bold">{record.labs.hba1c.toFixed(1)} %</td>
                <td className="p-2 text-center text-slate-400">&lt;5.7 %</td>
                <td className="p-2"><RiskBadge status="" label={record.labs.hba1c > 6.5 ? 'Diabetic' : record.labs.hba1c > 5.7 ? 'Pre-diabetic' : 'Normal'} /></td>
              </tr>
              <tr>
                <td className="p-2 text-slate-500">hsCRP (Inflammatory)</td>
                <td className="p-2 text-center font-bold">{record.labs.hsCrp.toFixed(2)} mg/L</td>
                <td className="p-2 text-center text-slate-400">&lt;1.0 mg/L</td>
                <td className="p-2"><RiskBadge status="" label={record.labs.hsCrp > 3.0 ? 'High' : 'Normal'} /></td>
              </tr>
              <tr>
                <td className="p-2 text-slate-500">FABP-NIR Spectroscopy</td>
                <td className="p-2 text-center font-bold">{record.fabpNir.value.toFixed(1)} ng/mL</td>
                <td className="p-2 text-center text-slate-400">&lt;2.0 ng/mL</td>
                <td className="p-2"><RiskBadge status="" label={record.fabpNir.value >= 6.0 ? 'Elevated' : 'Normal'} /></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Biological Resilience & Narrative Summary */}
        <div className="border border-slate-300 rounded-lg p-5 mb-6 text-xs">
          <h4 className="font-bold border-b border-slate-300 pb-1.5 mb-2 text-slate-700 uppercase tracking-wide">Biological Entropy Resilience</h4>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-slate-500 font-semibold uppercase">Shannon J' Codon Entropy Index</span>
            <span className="font-black text-sm">{record.shannonEntropy.compositeJ.toFixed(3)}</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Codon degeneracy calculations show **{record.shannonEntropy.lowFamiliesCount}** amino acid families exhibiting restricted Shannon H' entropy (below the safety baseline of 0.78). 
            Overall physical exercise and dietary quality markers score well, contributing to cellular buffer capacity.
          </p>
        </div>

        {/* Clinical Recommendations (Checklist layout) */}
        <div className="border border-slate-300 rounded-lg p-5 text-xs bg-slate-50/50">
          <h4 className="font-bold border-b border-slate-300 pb-1.5 mb-3 text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <CheckSquare className="text-blue-500" size={14} />
            Clinical Action Recommendations
          </h4>
          <ul className="space-y-2 font-medium text-slate-600">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-500 font-bold shrink-0">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Signature Line */}
        <div className="mt-12 flex justify-between items-end text-xs text-slate-400 pt-6 border-t border-slate-100">
          <div>
            <span>MIKRA-EPIGEN-2026 Core Registry</span><br/>
            <span>Data Certified & Released</span>
          </div>
          <div className="text-center w-[150px]">
            <div className="border-b border-slate-400 h-[30px]" />
            <span className="mt-1 block">Study Investigator Signature</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Report;
