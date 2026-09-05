import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { CommandCenter } from '@/pages/CommandCenter';
import { LiveMonitoring } from '@/pages/LiveMonitoring';
import { RainfallForecast } from '@/pages/RainfallForecast';
import { FloodPrediction } from '@/pages/FloodPrediction';
import { RiskImpact } from '@/pages/RiskImpact';
import { Alerts } from '@/pages/Alerts';
import { SafePlaces } from '@/pages/SafePlaces';
import { Evacuation } from '@/pages/Evacuation';
import { Reports } from '@/pages/Reports';
import { ModelPerformance } from '@/pages/ModelPerformance';
import { Settings } from '@/pages/Settings';
import { CitizenMode } from '@/pages/CitizenMode';
import type { PageId } from '@/types';

const PAGE_META: Record<PageId, { title: string; subtitle: string }> = {
  command: { title: 'AI FLOOD INTELLIGENCE', subtitle: 'Integrated Rainfall & Inundation Prediction' },
  monitoring: { title: 'LIVE MONITORING', subtitle: 'Real-time Data Source Surveillance' },
  rainfall: { title: 'RAINFALL FORECAST', subtitle: 'AI-Powered Precipitation Prediction' },
  flood: { title: 'FLOOD PREDICTION', subtitle: 'Inundation Modeling & Forecasting' },
  risk: { title: 'RISK & IMPACT', subtitle: 'Population & Infrastructure Assessment' },
  alerts: { title: 'ALERTS', subtitle: 'Active Alerts & Notification Management' },
  'safe-places': { title: 'SAFE PLACES', subtitle: 'Emergency Shelters & Safe Locations' },
  evacuation: { title: 'EVACUATION', subtitle: 'Route Planning & Navigation' },
  reports: { title: 'REPORTS', subtitle: 'Report Generation & Export' },
  model: { title: 'MODEL PERFORMANCE', subtitle: 'AI Accuracy & Analytics' },
  settings: { title: 'SETTINGS', subtitle: 'System Configuration' },
  citizen: { title: 'CITIZEN MODE', subtitle: 'Emergency Interface' },
};

function getPageFromLocation(): PageId {
  if (typeof window === 'undefined') return 'command';
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase() as PageId;
  if (hash && hash in PAGE_META) return hash;
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase() as PageId;
  if (path && path in PAGE_META) return path;
  return 'command';
}

function App() {
  const [page, setPage] = useState<PageId>(getPageFromLocation);

  useEffect(() => {
    const onHashChange = () => {
      const p = getPageFromLocation();
      setPage(p);
    };
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onHashChange);
    };
  }, []);

  const handleNavigate = useCallback((newPage: PageId) => {
    setPage(newPage);
    if (typeof window !== 'undefined') {
      window.location.hash = newPage;
    }
  }, []);

  if (page === 'citizen') {
    return <CitizenMode onExit={() => handleNavigate('command')} />;
  }

  const meta = PAGE_META[page] || PAGE_META.command;

  return (
    <div className="flex h-screen overflow-hidden bg-base-950">
      <Sidebar activePage={page} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto">
          {page === 'command' && <CommandCenter />}
          {page === 'monitoring' && <LiveMonitoring />}
          {page === 'rainfall' && <RainfallForecast />}
          {page === 'flood' && <FloodPrediction />}
          {page === 'risk' && <RiskImpact />}
          {page === 'alerts' && <Alerts />}
          {page === 'safe-places' && <SafePlaces />}
          {page === 'evacuation' && <Evacuation />}
          {page === 'reports' && <Reports />}
          {page === 'model' && <ModelPerformance />}
          {page === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default App;

