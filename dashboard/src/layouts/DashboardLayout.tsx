import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Heart, Activity, Layers, ShieldAlert, Dumbbell, Percent, Calendar, 
  FileText, Users, BarChart3, Map, Cpu, FlaskConical, Settings, Search, Sun, Moon, CheckSquare
} from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import { PatientProfile } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    cohort, 
    activePatientId, 
    activeTimepoint,
    filters, 
    darkMode, 
    setActivePatientId, 
    setActiveTimepoint,
    setFilters, 
    toggleDarkMode,
    resetFilters
  } = useDashboardStore();

  const [searchFocused, setSearchFocused] = useState(false);

  // Sidebar navigation items
  const personalNav = [
    { path: '/personal/overview', label: 'Overview', icon: Home },
    { path: '/personal/cardio', label: 'Cardiovascular', icon: Heart },
    { path: '/personal/labs', label: 'Laboratory', icon: Layers },
    { path: '/personal/molecular', label: 'Molecular', icon: FlaskConical },
    { path: '/personal/lifestyle', label: 'Lifestyle', icon: Dumbbell },
    { path: '/personal/intervention', label: 'Intervention Compliance', icon: Percent },
    { path: '/personal/timeline', label: 'Timeline Progress', icon: Calendar },
    { path: '/personal/report', label: 'Clinical Report', icon: FileText }
  ];

  const populationNav = [
    { path: '/population/overview', label: 'Cohort Overview', icon: Users },
    { path: '/population/clinical', label: 'Clinical Analytics', icon: Activity },
    { path: '/population/molecular', label: 'Molecular Analytics', icon: FlaskConical },
    { path: '/population/intervention', label: 'Intervention Analytics', icon: Percent },
    { path: '/population/districts', label: 'District Analytics', icon: Map },
    { path: '/population/ai', label: 'AI Analytics', icon: Cpu },
    { path: '/population/research', label: 'Research Matrix', icon: BarChart3 }
  ];

  // Kerala's 14 districts
  const districts = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 
    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 
    'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
  ];

  // Active patient object
  const activePatient = cohort.find(p => p.pid === activePatientId);

  // Handle active patient switch
  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '') {
      setActivePatientId(null);
    } else {
      setActivePatientId(val);
      // Automatically navigate to overview if switching patients
      if (location.pathname.startsWith('/population')) {
        navigate('/personal/overview');
      }
    }
  };

  const isPersonal = location.pathname.startsWith('/personal');

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* 1. SIDEBAR */}
      <nav className="no-print w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0 h-full">
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Logo Letterhead */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h1 className="font-extrabold text-sm tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              GREENAGE-KL
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">
              Diagnostics Extension
            </p>
          </div>

          {/* Personal Navigation Group */}
          <div className="px-3 py-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">
              Patient Analytics
            </span>
            <div className="space-y-1">
              {personalNav.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      if (!activePatientId && cohort.length > 0) {
                        // Select first patient if none selected
                        setActivePatientId(cohort[0].pid);
                      }
                      navigate(item.path);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950/20 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Population Navigation Group */}
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">
              Cohort Analytics
            </span>
            <div className="space-y-1">
              {populationNav.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950/20 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/10">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <span className="text-[10px] font-mono text-slate-400">EPIGEN-v2.6</span>
          <button 
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
            title="Settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </nav>

      {/* 2. MAIN APP FRAME */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        
        {/* Top Control Header Bar (hidden in print) */}
        <header className="no-print border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex flex-wrap gap-4 items-center justify-between z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            {/* Active Patient Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Focus Patient:</span>
              <select
                value={activePatientId || ''}
                onChange={handlePatientSelect}
                className="bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">-- No Patient Selected --</option>
                {cohort.map(p => (
                  <option key={p.pid} value={p.pid}>
                    {p.pid} ({p.group})
                  </option>
                ))}
              </select>
            </div>

            {/* Timepoint switch (only applicable when looking at personal dashboard) */}
            {activePatientId && isPersonal && (
              <div className="flex items-center gap-2 border-l border-slate-100 dark:border-slate-800 pl-4">
                <span className="text-xs text-slate-400 font-semibold uppercase">Visit:</span>
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
                  {(['BL', 'M6', 'M12'] as const).map(tp => {
                    const exists = !!activePatient?.timepoints[tp];
                    const isActive = activeTimepoint === tp;
                    
                    return (
                      <button
                        key={tp}
                        disabled={!exists}
                        onClick={() => setActiveTimepoint(tp)}
                        className={`px-3 py-1.5 transition-all ${
                          isActive 
                            ? 'bg-blue-600 text-white font-bold'
                            : exists
                              ? 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                              : 'bg-slate-100 text-slate-300 dark:bg-slate-950 dark:text-slate-700 cursor-not-allowed'
                        }`}
                      >
                        {tp}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Global cohort filter options (primarily filters population dashboards) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Gender filter */}
            <select
              value={filters.gender}
              onChange={e => setFilters({ gender: e.target.value })}
              className="bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-slate-500"
            >
              <option value="All">Sex: All</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>

            {/* District filter */}
            <select
              value={filters.district}
              onChange={e => setFilters({ district: e.target.value })}
              className="bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-slate-500 max-w-[120px]"
            >
              <option value="All">District: All</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Cohort Group filter */}
            <select
              value={filters.group}
              onChange={e => setFilters({ group: e.target.value })}
              className="bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-slate-500"
            >
              <option value="All">Arm: All</option>
              <option value="TEST">TEST Group</option>
              <option value="CTRL">CTRL Group</option>
            </select>

            {/* Reset Filters button */}
            <button 
              onClick={resetFilters}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-300 transition-all"
            >
              Reset Filters
            </button>
          </div>
        </header>

        {/* 3. SCROLLABLE CONTENT BODY */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
