export const getGaugeOption = (
  title: string,
  value: number,
  min: number,
  max: number,
  unit: string,
  colorRange: [number, string][] = [[0.3, '#ef4444'], [0.7, '#f59e0b'], [1, '#10b981']],
  darkMode: boolean = false
) => {
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const labelColor = darkMode ? '#94a3b8' : '#64748b';

  return {
    title: {
      text: title,
      left: 'center',
      top: 5,
      textStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: textColor
      }
    },
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min,
        max,
        radius: '90%',
        center: ['50%', '75%'],
        pointer: {
          show: true,
          length: '60%',
          width: 5,
          itemStyle: {
            color: '#3b82f6'
          }
        },
        axisLine: {
          lineStyle: {
            width: 12,
            color: colorRange
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: true,
          length: 12,
          lineStyle: {
            width: 2,
            color: '#cbd5e1'
          }
        },
        axisLabel: {
          color: labelColor,
          fontSize: 10,
          distance: -40,
          formatter: (v: number) => {
            if (v === min || v === max || v === Math.round((min + max) / 2)) {
              return `${v}`;
            }
            return '';
          }
        },
        detail: {
          offsetCenter: [0, '20%'],
          valueAnimation: true,
          formatter: (v: number) => `{value|${v.toFixed(1)}}{unit|${unit}}`,
          rich: {
            value: {
              fontSize: 22,
              fontWeight: 'bold',
              color: textColor
            },
            unit: {
              fontSize: 12,
              color: labelColor,
              padding: [0, 0, 4, 4]
            }
          }
        },
        data: [{ value }]
      }
    ]
  };
};

export const getRadarOption = (
  title: string,
  indicators: { name: string; max: number }[],
  data: { name: string; value: number[] }[],
  darkMode: boolean = false
) => {
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const lineColor = darkMode ? '#334155' : '#cbd5e1';

  return {
    title: {
      text: title,
      left: 'center',
      top: 5,
      textStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: textColor
      }
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: 0,
      left: 'center',
      data: data.map(item => item.name),
      textStyle: {
        color: textColor,
        fontSize: 10
      }
    },
    radar: {
      indicator: indicators,
      radius: '62%',
      center: ['50%', '52%'],
      axisName: {
        color: textColor,
        fontSize: 11,
        borderRadius: 3,
        padding: [3, 5]
      },
      splitLine: {
        lineStyle: {
          color: lineColor
        }
      },
      splitArea: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: lineColor
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: data.map(item => ({
          value: item.value,
          name: item.name,
          symbolSize: 4,
          lineStyle: {
            width: 2
          },
          areaStyle: {
            opacity: 0.15
          }
        }))
      }
    ]
  };
};

export const getLineTrendOption = (
  title: string,
  xAxisData: string[],
  series: { name: string; data: number[]; color?: string }[],
  yUnit: string,
  darkMode: boolean = false
) => {
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const gridLineColor = darkMode ? '#334155' : '#f1f5f9';

  return {
    title: {
      text: title,
      left: 'center',
      top: 5,
      textStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: textColor
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      bottom: 0,
      left: 'center',
      orient: 'horizontal',
      textStyle: {
        color: textColor,
        fontSize: 10
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLabel: {
        color: textColor
      }
    },
    yAxis: {
      type: 'value',
      name: yUnit,
      nameTextStyle: {
        color: textColor
      },
      axisLabel: {
        color: textColor
      },
      splitLine: {
        lineStyle: {
          color: gridLineColor
        }
      }
    },
    series: series.map(s => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      symbolSize: 6,
      lineStyle: {
        width: 3,
        color: s.color
      },
      itemStyle: {
        color: s.color
      }
    }))
  };
};

export const getBarOption = (
  title: string,
  xAxisData: string[],
  series: { name: string; data: number[]; color?: string }[],
  yUnit: string,
  darkMode: boolean = false
) => {
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const gridLineColor = darkMode ? '#334155' : '#f1f5f9';

  return {
    title: {
      text: title,
      left: 'center',
      top: 5,
      textStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: textColor
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      bottom: 0,
      left: 'center',
      orient: 'horizontal',
      textStyle: {
        color: textColor,
        fontSize: 10
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        color: textColor
      }
    },
    yAxis: {
      type: 'value',
      name: yUnit,
      nameTextStyle: {
        color: textColor
      },
      axisLabel: {
        color: textColor
      },
      splitLine: {
        lineStyle: {
          color: gridLineColor
        }
      }
    },
    series: series.map(s => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      itemStyle: {
        color: s.color
      },
      barMaxWidth: 35,
      borderRadius: [4, 4, 0, 0]
    }))
  };
};

export const getHeatmapOption = (
  title: string,
  xLabels: string[],
  yLabels: string[],
  matrixData: [number, number, number][], // [xIndex, yIndex, value]
  darkMode: boolean = false
) => {
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';

  return {
    title: {
      text: title,
      left: 'center',
      top: 5,
      textStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: textColor
      }
    },
    tooltip: {
      position: 'top',
      formatter: (p: any) => {
        return `${xLabels[p.value[0]]} vs ${yLabels[p.value[1]]}: <b>${p.value[2].toFixed(2)}</b>`;
      }
    },
    grid: {
      top: '18%',
      bottom: '18%',
      left: '18%',
      right: '5%'
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      splitArea: {
        show: true
      },
      axisLabel: {
        interval: 0,
        rotate: 35,
        color: textColor,
        fontSize: 9
      }
    },
    yAxis: {
      type: 'category',
      data: yLabels,
      splitArea: {
        show: true
      },
      axisLabel: {
        color: textColor,
        fontSize: 9
      }
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#ef4444', '#f8fafc', '#10b981'] // Red to White to Green (negative to positive correlation)
      },
      textStyle: {
        color: textColor,
        fontSize: 10
      }
    },
    series: [
      {
        name: 'Correlation',
        type: 'heatmap',
        data: matrixData,
        label: {
          show: true,
          formatter: (p: any) => p.value[2].toFixed(2),
          fontSize: 9,
          color: '#0f172a'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
};

export const getScatterOption = (
  title: string,
  xAxisName: string,
  yAxisName: string,
  data: [number, number][],
  seriesName: string = 'Cohort Patients',
  darkMode: boolean = false
) => {
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const gridLineColor = darkMode ? '#334155' : '#f1f5f9';

  return {
    title: {
      text: title,
      left: 'center',
      top: 5,
      textStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: textColor
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${xAxisName}: ${params.value[0].toFixed(1)}<br/>${yAxisName}: ${params.value[1].toFixed(1)}`;
      }
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '12%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      name: xAxisName,
      nameLocation: 'middle',
      nameGap: 24,
      nameTextStyle: {
        color: textColor
      },
      splitLine: {
        lineStyle: {
          color: gridLineColor
        }
      },
      axisLabel: {
        color: textColor
      }
    },
    yAxis: {
      name: yAxisName,
      nameTextStyle: {
        color: textColor
      },
      splitLine: {
        lineStyle: {
          color: gridLineColor
        }
      },
      axisLabel: {
        color: textColor
      }
    },
    series: [
      {
        name: seriesName,
        type: 'scatter',
        data,
        symbolSize: 8,
        itemStyle: {
          color: '#3b82f6',
          opacity: 0.7
        }
      }
    ]
  };
};
