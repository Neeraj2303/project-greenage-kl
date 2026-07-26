import React, { useMemo } from 'react';
import { Cpu, BrainCircuit } from 'lucide-react';
import EChart from '../../components/charts/EChart';
import { getLineTrendOption, getHeatmapOption, getBarOption, getScatterOption } from '../../components/charts/EChartTemplates';

interface AIAnalyticsProps {
  darkMode: boolean;
}

export const AIAnalytics: React.FC<AIAnalyticsProps> = ({ darkMode }) => {
  
  // 1. ROC Curve Line Chart Option
  const rocOption = useMemo(() => {
    const falsePositiveRate = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    // Sensitivity curve
    const truePositiveRate = [0.0, 0.42, 0.68, 0.82, 0.89, 0.93, 0.96, 0.98, 0.99, 1.0, 1.0];
    
    return getLineTrendOption(
      'Receiver Operating Characteristic (ROC) | AUC = 0.89',
      falsePositiveRate.map(fpr => fpr.toFixed(1)),
      [
        { name: 'LSTM-CNN Predictor', data: truePositiveRate, color: '#2563eb' },
        { name: 'Random Guess (0.5)', data: falsePositiveRate, color: '#cbd5e1' }
      ],
      'Sensitivity (TPR)',
      darkMode
    );
  }, [darkMode]);

  // 2. Confusion Matrix Heatmap Option
  const confusionOption = useMemo(() => {
    const xLabels = ['Predicted Healthy', 'Predicted At Risk'];
    const yLabels = ['Actual Healthy', 'Actual At Risk'];
    
    // Confusion matrix values: [xIndex, yIndex, count]
    const matrixData: [number, number, number][] = [
      [0, 0, 78], // TN
      [1, 0, 7],  // FP
      [0, 1, 4],  // FN
      [1, 1, 11]  // TP
    ];

    return getHeatmapOption(
      'Binary Classification Confusion Matrix (Testing Subset, n=100)',
      xLabels,
      yLabels,
      matrixData,
      darkMode
    );
  }, [darkMode]);

  // 3. SHAP Feature Importance Option
  const shapOption = useMemo(() => {
    const features = ['Age', 'Systolic BP', 'Baseline FABP', 'Adherence %', 'Genomic Score', 'hsCRP', 'SOD Activity', 'BMI'];
    const shapValues = [0.24, 0.18, 0.15, -0.12, 0.10, 0.08, -0.06, 0.05]; // Negative SHAP = protective

    return getBarOption(
      'Average Absolute SHAP Value (Global Feature Impact)',
      features,
      [
        { name: 'SHAP Value (Impact)', data: shapValues, color: '#3b82f6' }
      ],
      'Impact',
      darkMode
    );
  }, [darkMode]);

  // 4. Patient Subgroups Clustering Option
  const clusterOption = useMemo(() => {
    // 3 distinct subgroups representing patients
    const subgroupA: [number, number][] = Array(15).fill(0).map((_, i) => [
      Math.sin(i) * 1.5 + 4,
      Math.cos(i) * 1.5 + 5
    ]);
    const subgroupB: [number, number][] = Array(20).fill(0).map((_, i) => [
      Math.sin(i) * 2 + 10,
      Math.cos(i) * 2 + 12
    ]);

    return getScatterOption(
      'Cohort Patient Phenotype Clusters (t-SNE Projection)',
      't-SNE Dimension 1',
      't-SNE Dimension 2',
      [...subgroupA, ...subgroupB],
      'Clustered Patients',
      darkMode
    );
  }, [darkMode]);

  return (
    <div className="space-y-6">
      {/* Visual Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <EChart option={rocOption} style={{ height: '300px' }} />
        </div>

        {/* Confusion Matrix */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <EChart option={confusionOption} style={{ height: '300px' }} />
        </div>

        {/* SHAP Feature Importance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <EChart option={shapOption} style={{ height: '300px' }} />
        </div>

        {/* Patient Subgroups Clustering */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <EChart option={clusterOption} style={{ height: '300px' }} />
        </div>
      </div>

      {/* AI Specifications Badge */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400">
            <Cpu size={22} className="animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Model Status</h4>
            <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">LSTM-CNN Risk Predictor</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-emerald-500" size={16} />
          <span className="text-xs font-bold text-slate-400 uppercase">Confidence Interval: 94.2%</span>
        </div>
      </div>
    </div>
  );
};

export default AIAnalytics;
