import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useDashboardStore } from '../../store/dashboardStore';

interface EChartProps {
  option: any;
  style?: React.CSSProperties;
  className?: string;
}

export const EChart: React.FC<EChartProps> = ({ option, style, className }) => {
  const darkMode = useDashboardStore(state => state.darkMode);

  // Deep copy and inject theme parameters
  const themeOption = {
    ...option,
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'Inter, Manrope, sans-serif',
      color: darkMode ? '#e2e8f0' : '#1e293b'
    }
  };

  if (themeOption.title) {
    themeOption.title = {
      ...themeOption.title,
      textStyle: {
        ...themeOption.title.textStyle,
        color: darkMode ? '#f1f5f9' : '#0f172a'
      }
    };
  }

  return (
    <ReactECharts
      option={themeOption}
      style={{ height: '320px', width: '100%', ...style }}
      className={className}
      theme={darkMode ? 'dark' : undefined}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};

export default EChart;
