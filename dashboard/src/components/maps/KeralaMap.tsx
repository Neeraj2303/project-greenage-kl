import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { keralaGeoJSON } from './KeralaGeoJSON';
import { PatientProfile } from '../../types';
import { useDashboardStore } from '../../store/dashboardStore';

// Leaflet CSS needs to be imported or loaded
import 'leaflet/dist/leaflet.css';

interface KeralaMapProps {
  metric: 'avgRisk' | 'htn' | 'fabp' | 'obesity' | 'compliance' | 'population';
  cohort: PatientProfile[];
  onSelectDistrict?: (district: string) => void;
}

export const KeralaMap: React.FC<KeralaMapProps> = ({ metric, cohort, onSelectDistrict }) => {
  const darkMode = useDashboardStore(state => state.darkMode);
  const geoJsonRef = useRef<L.GeoJSON>(null);

  // 1. Calculate district-level aggregated data
  const districtData = React.useMemo(() => {
    const aggregates: {
      [name: string]: {
        riskSum: number;
        htnCount: number;
        fabpSum: number;
        obesityCount: number;
        complianceSum: number;
        complianceCount: number;
        count: number;
      }
    } = {};

    cohort.forEach(p => {
      const record = p.timepoints.BL; // Use Baseline for geographic summaries
      if (!record) return;

      const dName = p.district;
      if (!aggregates[dName]) {
        aggregates[dName] = {
          riskSum: 0,
          htnCount: 0,
          fabpSum: 0,
          obesityCount: 0,
          complianceSum: 0,
          complianceCount: 0,
          count: 0
        };
      }

      const agg = aggregates[dName];
      agg.count += 1;
      agg.riskSum += record.genomics.totalScore;
      agg.fabpSum += record.fabpNir.value;
      
      // Hypertension is defined as SBP >= 130 or DBP >= 80 (Stage 1+) or known history
      if (record.vitals.sbpAvg >= 130 || record.vitals.dbpAvg >= 80) {
        agg.htnCount += 1;
      }

      // Obesity: BMI >= 25 (Asian threshold)
      if (record.anthropometry.bmi >= 25) {
        agg.obesityCount += 1;
      }

      // Compliance
      if (p.group === 'TEST') {
        agg.complianceSum += record.compliance.overallPct;
        agg.complianceCount += 1;
      }
    });

    const rates: { [name: string]: number } = {};
    Object.keys(aggregates).forEach(name => {
      const agg = aggregates[name];
      if (metric === 'population') {
        rates[name] = agg.count;
      } else if (metric === 'avgRisk') {
        rates[name] = agg.riskSum / agg.count;
      } else if (metric === 'htn') {
        rates[name] = (agg.htnCount / agg.count) * 100;
      } else if (metric === 'fabp') {
        rates[name] = agg.fabpSum / agg.count;
      } else if (metric === 'obesity') {
        rates[name] = (agg.obesityCount / agg.count) * 100;
      } else if (metric === 'compliance') {
        rates[name] = agg.complianceCount > 0 ? (agg.complianceSum / agg.complianceCount) : 0;
      }
    });

    return rates;
  }, [cohort, metric]);

  // Determine max value for color scale calculations
  const maxValue = React.useMemo(() => {
    const vals = Object.values(districtData);
    if (vals.length === 0) return 100;
    return Math.max(...vals, 1);
  }, [districtData]);

  // Color mapping based on metric
  const getColor = (val: number) => {
    const ratio = Math.min(val / maxValue, 1);
    
    if (metric === 'compliance') {
      // High compliance is green, low is red/yellow
      if (val === 0) return '#cbd5e1'; // No data
      if (ratio > 0.8) return '#10b981'; // Emerald
      if (ratio > 0.6) return '#3b82f6'; // Blue
      if (ratio > 0.4) return '#f59e0b'; // Orange
      return '#ef4444'; // Red
    }
    
    // For risk factors: High is red/orange, low is green/blue
    if (ratio > 0.75) return '#ef4444'; // Red
    if (ratio > 0.50) return '#f59e0b'; // Orange
    if (ratio > 0.25) return '#3b82f6'; // Blue
    return '#10b981'; // Green
  };

  const getStyle = (feature: any) => {
    const dName = feature?.properties?.name || '';
    const val = districtData[dName] || 0;
    return {
      fillColor: getColor(val),
      weight: 0.5,
      opacity: 0.5,
      color: darkMode ? '#0f172a' : '#f8fafc',
      fillOpacity: 0.70
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const dName = feature.properties.name;

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.85,
          weight: 1.5,
          color: '#3b82f6'
        });
      },
      mouseout: (e) => {
        const l = e.target;
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(l);
        }
      },
      click: () => {
        if (onSelectDistrict) {
          onSelectDistrict(dName);
        }
      }
    });
  };

  // Re-draw GeoJSON styles and update permanent labels when metric/data changes
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.eachLayer((layer: any) => {
        if (layer.feature) {
          layer.setStyle(getStyle(layer.feature));

          const dName = layer.feature.properties.name;
          const val = districtData[dName] || 0;
          let unit = '';
          if (metric === 'htn' || metric === 'obesity' || metric === 'compliance') unit = '%';
          else if (metric === 'fabp') unit = ' ng/mL';
          else if (metric === 'population') unit = ' cases';

          layer.unbindTooltip();
          layer.bindTooltip(`
            <div class="district-map-label">
              <span class="district-name">${dName}</span>
              <span class="district-value">${val.toFixed(0)}${unit}</span>
            </div>
          `, { permanent: true, direction: 'center', className: 'district-label' });
        }
      });
    }
  }, [districtData, metric, darkMode]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800" style={{ height: '500px' }}>
      <MapContainer
        center={[10.5, 76.5]} // Center of Kerala
        zoom={7}
        style={{ height: '100%', width: '100%', background: darkMode ? '#0f172a' : '#f8fafc' }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            darkMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          }
        />
        <GeoJSON
          ref={geoJsonRef}
          data={keralaGeoJSON as any}
          style={getStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-md z-[1000] font-sans text-xs text-slate-700 dark:text-slate-300">
        <div className="font-bold mb-1.5 capitalize">{metric.replace('avg', 'avg. ')} Legend</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: getColor(maxValue * 0.9) }} />
            <span>High Risk / High Value</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: getColor(maxValue * 0.5) }} />
            <span>Moderate Value</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: getColor(maxValue * 0.1) }} />
            <span>Low Risk / Baseline</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeralaMap;
