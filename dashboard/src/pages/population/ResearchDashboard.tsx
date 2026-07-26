import React, { useState, useMemo } from 'react';
import { HelpCircle, Filter } from 'lucide-react';
import EChart from '../../components/charts/EChart';
import { getHeatmapOption } from '../../components/charts/EChartTemplates';

interface ResearchDashboardProps {
  darkMode: boolean;
}

export const ResearchDashboard: React.FC<ResearchDashboardProps> = ({ darkMode }) => {
  const [categories, setCategories] = useState({
    clinical: true,
    laboratory: true,
    genomic: true,
    lifestyle: false,
    environmental: false
  });

  const handleToggle = (key: keyof typeof categories) => {
    setCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const heatmapOption = useMemo(() => {
    // Variable mappings by category
    const variables: { name: string; category: string }[] = [];
    if (categories.clinical) {
      variables.push({ name: 'Age', category: 'clinical' });
      variables.push({ name: 'Systolic BP', category: 'clinical' });
      variables.push({ name: 'BMI Index', category: 'clinical' });
    }
    if (categories.laboratory) {
      variables.push({ name: 'LDL-C', category: 'laboratory' });
      variables.push({ name: 'HbA1c', category: 'laboratory' });
      variables.push({ name: 'hsCRP', category: 'laboratory' });
    }
    if (categories.genomic) {
      variables.push({ name: 'Genomic Score', category: 'genomic' });
      variables.push({ name: 'DNA 5-mC', category: 'genomic' });
    }
    if (categories.lifestyle) {
      variables.push({ name: 'Exercise', category: 'lifestyle' });
      variables.push({ name: 'Diet Quality', category: 'lifestyle' });
      variables.push({ name: 'Stress Index', category: 'lifestyle' });
    }
    if (categories.environmental) {
      variables.push({ name: 'Particulates PM2.5', category: 'environmental' });
      variables.push({ name: 'Air Humidity', category: 'environmental' });
    }

    const labels = variables.map(v => v.name);
    const size = labels.length;

    if (size === 0) {
      return getHeatmapOption('Select at least one variable category', [], [], [], darkMode);
    }

    // Build mock correlation matrix values dynamically
    const matrixData: [number, number, number][] = [];
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (x === y) {
          matrixData.push([x, y, 1.0]);
        } else {
          // Generate a deterministic mock correlation coefficient based on variable names
          const hash = (labels[x].length * labels[y].length * 17) % 100;
          let coeff = (hash / 100) * 1.6 - 0.8; // range from -0.8 to +0.8
          
          // Force some clinically meaningful values
          if (labels[x] === 'Systolic BP' && labels[y] === 'Age') coeff = 0.58;
          if (labels[x] === 'Age' && labels[y] === 'Systolic BP') coeff = 0.58;
          if (labels[x] === 'BMI Index' && labels[y] === 'LDL-C') coeff = 0.44;
          if (labels[x] === 'LDL-C' && labels[y] === 'BMI Index') coeff = 0.44;
          if (labels[x] === 'Exercise' && labels[y] === 'Stress Index') coeff = -0.62;
          if (labels[x] === 'Stress Index' && labels[y] === 'Exercise') coeff = -0.62;
          if (labels[x] === 'Genomic Score' && labels[y] === 'DNA 5-mC') coeff = 0.35;
          if (labels[x] === 'DNA 5-mC' && labels[y] === 'Genomic Score') coeff = 0.35;
          if (labels[x] === 'Particulates PM2.5' && labels[y] === 'hsCRP') coeff = 0.48;
          if (labels[x] === 'hsCRP' && labels[y] === 'Particulates PM2.5') coeff = 0.48;

          matrixData.push([x, y, coeff]);
        }
      }
    }

    return getHeatmapOption(
      'Pearson Multi-Variable Association Heatmap (Cohort Baseline, n=100)',
      labels,
      labels,
      matrixData,
      darkMode
    );
  }, [categories, darkMode]);

  return (
    <div className="space-y-6">
      {/* Category Toggle Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <Filter size={16} />
          <span className="text-xs font-semibold uppercase">Variable Layer Filters</span>
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs font-semibold">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={categories.clinical}
              onChange={() => handleToggle('clinical')}
              className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            Clinical Variables
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={categories.laboratory}
              onChange={() => handleToggle('laboratory')}
              className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            Laboratory Variables
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={categories.genomic}
              onChange={() => handleToggle('genomic')}
              className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            Genomic & Epigenetics
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={categories.lifestyle}
              onChange={() => handleToggle('lifestyle')}
              className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            Lifestyle Factors
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={categories.environmental}
              onChange={() => handleToggle('environmental')}
              className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            Environmental Exposures
          </label>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <EChart option={heatmapOption} style={{ height: '480px' }} />
      </div>

      {/* Diagnostic Tip */}
      <div className="bg-blue-50/50 dark:bg-slate-950/20 p-3 rounded-lg border border-blue-100 dark:border-slate-800/40 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
        <HelpCircle className="text-blue-500 shrink-0 mt-0.5" size={14} />
        <span>
          Correlation coefficients are calculated using Pearson's product-moment correlation (R). Scale colors range from intense red (highly negative correlation, R = -1.0) to pure white (no association, R = 0.0) and intense emerald green (highly positive association, R = +1.0).
        </span>
      </div>
    </div>
  );
};

export default ResearchDashboard;
