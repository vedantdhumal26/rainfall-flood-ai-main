import { useState, useMemo } from 'react';
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
import { useCountUp } from '@/hooks/useCountUp';
import type { KPICard } from '@/types';

export function CommandCenter() {
  const simulation = useSimulation();
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(null);

  const phase = simulation.currentPhase;
  const isNormal = simulation.scenarioId === 'normal' && !simulation.isRunning && simulation.phaseIndex === 0;

  const activeKpis: KPICard[] = useMemo(() => {
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
  }, [phase, isNormal]);

  const showRedAlert = phase?.level === 'red';
  const showOrangeAlert = phase?.level === 'orange';
  const populationAtRisk = phase?.populationAtRisk ?? 0;
  const infrastructureAtRisk = phase?.infrastructure ?? 0;

  const alertData = showRedAlert
    ? { level: 'red' as const, title: 'RED ALERT — SEVERE FLOOD RISK', description: 'Extreme rainfall and rapid inundation predicted', region: 'Pune Region', eta: `${phase.arrivalTime} minutes` }
    : showOrangeAlert
      ? { level: 'orange' as const, title: 'ORANGE ALERT — HIGH FLOOD RISK', description: 'Heavy rainfall detected, flood risk rising', region: 'Pune Region', eta: `${phase.arrivalTime} minutes` }
      : null;

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Flood Intelligence Command Center</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time rainfall intelligence, flood prediction and emergency decision support</p>
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
        {activeKpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
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
