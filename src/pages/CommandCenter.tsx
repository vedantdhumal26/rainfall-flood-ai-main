import { useState, useMemo, useEffect, useCallback } from 'react';
import { MapView } from '@/components/maps/MapView';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { KpiCard } from '@/components/ui/KpiCard';
import { PipelineStatus } from '@/components/ui/PipelineStatus';
import { FloodRiskTimeline } from '@/components/ui/FloodRiskTimeline';
import { ModelConfidence } from '@/components/ui/ModelConfidence';
import { AlertTimeline } from '@/components/ui/AlertTimeline';
import { RainfallChart } from '@/components/charts/RainfallChart';
import { ForecastTimeline } from '@/components/ui/ForecastTimeline';
import { SimulationPanel } from '@/components/ui/SimulationPanel';
import { RiskImpactPanel } from '@/components/ui/RiskImpactPanel';
import { KPIS_SEVERE, KPIS_NORMAL, PIPELINE_STAGES } from '@/data/mockData';
import { useSimulation } from '@/hooks/useSimulation';
import { dashboardApi, type DashboardSummary } from '@/api/dashboard';
import type { KPICard } from '@/types';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';

export function CommandCenter() {
  const simulation = useSimulation();
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(() => {
    dashboardApi.getSummary()
      .then((data) => {
        setSummary(data);
        setError(null);
      })
      .catch((err) => {
        console.warn('[CommandCenter] Error loading live dashboard summary:', err);
        setError('Live backend sync paused. Displaying simulated baseline.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Poll summary every 10 seconds or when simulation phase changes
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, simulation.phaseIndex, simulation.scenarioId]);

  const phase = simulation.currentPhase;
  const isNormal = simulation.scenarioId === 'normal' && !simulation.isRunning && simulation.phaseIndex === 0;

  // Active KPIs derived from live backend summary with fallback
  const activeKpis: KPICard[] = useMemo(() => {
    if (summary && summary.kpis && summary.kpis.length > 0) {
      return summary.kpis;
    }
    if (!phase || isNormal) return KPIS_NORMAL;
    return KPIS_SEVERE.map((kpi) => {
      if (kpi.id === 'rainfall') return { ...kpi, value: String(phase.rainfall) };
      if (kpi.id === 'flood-prob') return { ...kpi, value: String(phase.floodProbability) };
      if (kpi.id === 'water-depth') return { ...kpi, value: phase.waterDepth.toFixed(2) };
      if (kpi.id === 'arrival')
        return { ...kpi, value: phase.arrivalTime > 0 ? String(phase.arrivalTime) : '—', sublabel: phase.arrivalTime > 0 ? 'Earliest predicted' : 'No flood expected' };
      if (kpi.id === 'population') return { ...kpi, value: phase.populationAtRisk.toLocaleString('en-IN') };
      if (kpi.id === 'infrastructure') return { ...kpi, value: String(phase.infrastructure) };
      return kpi;
    });
  }, [summary, phase, isNormal]);

  // Alert banner data from backend or current simulation phase
  const alertData = useMemo(() => {
    if (summary?.active_banner) {
      return summary.active_banner;
    }
    const showRed = phase?.level === 'red';
    const showOrange = phase?.level === 'orange';
    if (showRed) {
      return {
        level: 'red' as const,
        title: 'RED ALERT — SEVERE FLOOD RISK',
        description: 'Extreme rainfall and rapid inundation predicted across low-lying wards.',
        region: 'Pune Metropolitan Region',
        eta: `${phase?.arrivalTime || 42} minutes`,
      };
    }
    if (showOrange) {
      return {
        level: 'orange' as const,
        title: 'ORANGE ALERT — HIGH FLOOD RISK',
        description: 'Heavy rainfall detected, flood risk rising in riverbank sectors.',
        region: 'Pune Metropolitan Region',
        eta: `${phase?.arrivalTime || 65} minutes`,
      };
    }
    return null;
  }, [summary, phase]);

  const populationAtRisk = summary ? summary.population_at_risk : (phase?.populationAtRisk ?? 0);
  const infrastructureAtRisk = summary ? summary.infrastructure_at_risk : (phase?.infrastructure ?? 0);

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Simulation Banner */}
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-base-900 border border-accent-500/20 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-400"></span>
          </span>
          <span className="font-semibold text-accent-300">SIMULATION ENGINE ACTIVE</span>
          <span className="text-slate-500 hidden sm:inline">— Prototype demonstration data integrated with AI models</span>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-risk-high flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </span>
          )}
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-3 h-3" />
            Sync
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Flood Intelligence Command Center</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time rainfall intelligence, flood prediction, and emergency decision support</p>
      </div>

      {/* Alert Banner */}
      {alertData && (
        <AlertBanner
          title={alertData.title}
          description={alertData.description}
          region={alertData.region}
          eta={alertData.eta}
          onViewPlan={() => setFocusTarget([18.5320, 73.8440])}
        />
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {loading && !summary
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="panel p-4 animate-pulse space-y-2">
                <div className="h-3 bg-white/10 rounded w-16" />
                <div className="h-7 bg-white/15 rounded w-20" />
                <div className="h-2 bg-white/5 rounded w-24" />
              </div>
            ))
          : activeKpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Main Content: Map + Side Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Map + Timeline */}
        <div className="xl:col-span-8 space-y-4">
          <div className="panel p-1 h-[480px]">
            <MapView height="100%" focusTarget={focusTarget} />
          </div>
          <ForecastTimeline />
        </div>

        {/* Right Side Panels */}
        <div className="xl:col-span-4 space-y-4">
          <SimulationPanel simulation={simulation} />
          <ModelConfidence />
        </div>
      </div>

      {/* Pipeline + Analytics Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 space-y-4">
          <PipelineStatus stages={PIPELINE_STAGES} isRunning={simulation.isRunning} />
          <RainfallChart />
        </div>
        <div className="xl:col-span-4 space-y-4">
          <FloodRiskTimeline />
          <RiskImpactPanel
            populationAtRisk={populationAtRisk}
            infrastructureAtRisk={infrastructureAtRisk}
            onInfrastructureClick={() => setFocusTarget([18.5308, 73.8758])}
          />
          <AlertTimeline />
        </div>
      </div>
    </div>
  );
}
