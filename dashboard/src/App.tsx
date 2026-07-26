import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useDashboardStore from './store/dashboardStore';
import { generateCohort, mergeLocalData } from './services/mockData';
import DashboardLayout from './layouts/DashboardLayout';
import { PatientBanner } from './components/ui/UIComponents';

// Pages - Personal
import Overview from './pages/personal/Overview';
import Cardiovascular from './pages/personal/Cardiovascular';
import Laboratory from './pages/personal/Laboratory';
import Molecular from './pages/personal/Molecular';
import Lifestyle from './pages/personal/Lifestyle';
import Intervention from './pages/personal/Intervention';
import Timeline from './pages/personal/Timeline';
import Report from './pages/personal/Report';

// Pages - Population
import CohortOverview from './pages/population/CohortOverview';
import ClinicalAnalytics from './pages/population/ClinicalAnalytics';
import MolecularAnalytics from './pages/population/MolecularAnalytics';
import InterventionAnalytics from './pages/population/InterventionAnalytics';
import DistrictAnalytics from './pages/population/DistrictAnalytics';
import AIAnalytics from './pages/population/AIAnalytics';
import ResearchDashboard from './pages/population/ResearchDashboard';

export const App: React.FC = () => {
  const { 
    cohort, 
    activePatientId, 
    activeTimepoint, 
    setCohort, 
    setActivePatientId,
    darkMode
  } = useDashboardStore();

  // 1. Initialize cohort database on mount
  useEffect(() => {
    const data = generateCohort(100);
    const mergedData = mergeLocalData(data);
    setCohort(mergedData);
    
    // Set default active patient
    if (data.length > 0) {
      setActivePatientId(data[0].pid);
    }
  }, [setCohort, setActivePatientId]);

  // Load active patient and specific record context
  const activePatient = cohort.find(p => p.pid === activePatientId);
  const activeRecord = activePatient?.timepoints[activeTimepoint];

  return (
    <Router>
      <DashboardLayout>
        <Routes>
          {/* Default redirect to Personal Overview */}
          <Route path="/" element={<Navigate to="/personal/overview" replace />} />

          {/* Group 1: Personal Dashboard */}
          <Route 
            path="/personal/overview" 
            element={
              activePatient && activeRecord ? (
                <>
                  <PatientBanner 
                    pid={activePatient.pid}
                    name={activePatient.name}
                    age={activePatient.age}
                    gender={activePatient.gender}
                    district={activePatient.district}
                    group={activePatient.group}
                    timepoint={activeTimepoint}
                    healthScore={activeRecord.overallHealthScore}
                  />
                  <Overview patient={activePatient} record={activeRecord} darkMode={darkMode} />
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">Loading patient profile...</div>
              )
            } 
          />

          <Route 
            path="/personal/cardio" 
            element={
              activePatient && activeRecord ? (
                <>
                  <PatientBanner 
                    pid={activePatient.pid}
                    name={activePatient.name}
                    age={activePatient.age}
                    gender={activePatient.gender}
                    district={activePatient.district}
                    group={activePatient.group}
                    timepoint={activeTimepoint}
                    healthScore={activeRecord.overallHealthScore}
                  />
                  <Cardiovascular patient={activePatient} record={activeRecord} darkMode={darkMode} />
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">Loading patient profile...</div>
              )
            } 
          />

          <Route 
            path="/personal/labs" 
            element={
              activePatient && activeRecord ? (
                <>
                  <PatientBanner 
                    pid={activePatient.pid}
                    name={activePatient.name}
                    age={activePatient.age}
                    gender={activePatient.gender}
                    district={activePatient.district}
                    group={activePatient.group}
                    timepoint={activeTimepoint}
                    healthScore={activeRecord.overallHealthScore}
                  />
                  <Laboratory patient={activePatient} record={activeRecord} darkMode={darkMode} />
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">Loading patient profile...</div>
              )
            } 
          />

          <Route 
            path="/personal/molecular" 
            element={
              activePatient && activeRecord ? (
                <>
                  <PatientBanner 
                    pid={activePatient.pid}
                    name={activePatient.name}
                    age={activePatient.age}
                    gender={activePatient.gender}
                    district={activePatient.district}
                    group={activePatient.group}
                    timepoint={activeTimepoint}
                    healthScore={activeRecord.overallHealthScore}
                  />
                  <Molecular patient={activePatient} record={activeRecord} darkMode={darkMode} />
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">Loading patient profile...</div>
              )
            } 
          />

          <Route 
            path="/personal/lifestyle" 
            element={
              activePatient && activeRecord ? (
                <>
                  <PatientBanner 
                    pid={activePatient.pid}
                    name={activePatient.name}
                    age={activePatient.age}
                    gender={activePatient.gender}
                    district={activePatient.district}
                    group={activePatient.group}
                    timepoint={activeTimepoint}
                    healthScore={activeRecord.overallHealthScore}
                  />
                  <Lifestyle patient={activePatient} record={activeRecord} darkMode={darkMode} />
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">Loading patient profile...</div>
              )
            } 
          />

          <Route 
            path="/personal/intervention" 
            element={
              activePatient && activeRecord ? (
                <>
                  <PatientBanner 
                    pid={activePatient.pid}
                    name={activePatient.name}
                    age={activePatient.age}
                    gender={activePatient.gender}
                    district={activePatient.district}
                    group={activePatient.group}
                    timepoint={activeTimepoint}
                    healthScore={activeRecord.overallHealthScore}
                  />
                  <Intervention patient={activePatient} record={activeRecord} darkMode={darkMode} />
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">Loading patient profile...</div>
              )
            } 
          />

          <Route 
            path="/personal/timeline" 
            element={
              activePatient ? (
                <Timeline patient={activePatient} darkMode={darkMode} />
              ) : (
                <div className="text-center py-12 text-slate-400">Loading patient timeline...</div>
              )
            } 
          />

          <Route 
            path="/personal/report" 
            element={
              activePatient && activeRecord ? (
                <Report patient={activePatient} record={activeRecord} />
              ) : (
                <div className="text-center py-12 text-slate-400">Loading clinical report...</div>
              )
            } 
          />

          {/* Group 2: Population Dashboard */}
          <Route 
            path="/population/overview" 
            element={<CohortOverview cohortList={cohort} darkMode={darkMode} />} 
          />
          <Route 
            path="/population/clinical" 
            element={<ClinicalAnalytics cohortList={cohort} darkMode={darkMode} />} 
          />
          <Route 
            path="/population/molecular" 
            element={<MolecularAnalytics cohortList={cohort} darkMode={darkMode} />} 
          />
          <Route 
            path="/population/intervention" 
            element={<InterventionAnalytics cohortList={cohort} darkMode={darkMode} />} 
          />
          <Route 
            path="/population/districts" 
            element={<DistrictAnalytics cohortList={cohort} darkMode={darkMode} />} 
          />
          <Route 
            path="/population/ai" 
            element={<AIAnalytics darkMode={darkMode} />} 
          />
          <Route 
            path="/population/research" 
            element={<ResearchDashboard darkMode={darkMode} />} 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
};

export default App;
