export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe';

export type AlertLevel = 'green' | 'yellow' | 'orange' | 'red';

export type PageId =
  | 'command'
  | 'monitoring'
  | 'rainfall'
  | 'flood'
  | 'risk'
  | 'alerts'
  | 'safe-places'
  | 'evacuation'
  | 'reports'
  | 'model'
  | 'settings'
  | 'citizen';

export interface KPICard {
  id: string;
  label: string;
  value: string;
  unit?: string;
  sublabel: string;
  trend?: number;
  trendDirection?: 'up' | 'down';
  icon: string;
  riskLevel?: RiskLevel;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'complete' | 'processing' | 'waiting';
  icon: string;
}

export interface AlertEvent {
  id: string;
  time: string;
  level: AlertLevel;
  title: string;
  description: string;
}

export interface InfrastructureItem {
  id: string;
  type: 'hospital' | 'school' | 'bridge' | 'road';
  name: string;
  count: number;
  atRisk: number;
  position: [number, lat: number];
}

export interface SafeLocation {
  id: string;
  name: string;
  distance: number;
  capacity: number;
  occupancy: number;
  risk: RiskLevel;
  travelTime: number;
  position: [number, number];
  address: string;
  lat?: number;
  lon?: number;
}

export interface EvacuationRoute {
  id: string;
  name: string;
  distance: number;
  duration: number;
  risk: RiskLevel;
  routeType: 'recommended' | 'alternate';
  path: [number, number][];
}

export interface MapLayerConfig {
  id: string;
  name: string;
  group: 'Weather' | 'Prediction' | 'Risk' | 'Response';
  active: boolean;
  color: string;
}

export interface ForecastPoint {
  time: string;
  hour: number;
  observed: number | null;
  predicted: number;
  confidenceUpper: number;
  confidenceLower: number;
}

export interface RainfallForecast {
  nowcast: ForecastPoint[];
  shortTerm: ForecastPoint[];
  cumulative: { time: string; hour: number; value: number }[];
  probability: { time: string; hour: number; value: number }[];
}

export interface FloodRiskPoint {
  time: string;
  hour: number;
  level: RiskLevel;
  probability: number;
  label: string;
}

export interface ModelMetric {
  label: string;
  value: number;
  unit?: string;
}

export interface ConfidenceFactor {
  label: string;
  percentage: number;
  color: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  phases: SimulationPhase[];
}

export interface SimulationPhase {
  level: AlertLevel;
  label: string;
  floodProbability: number;
  rainfall: number;
  waterDepth: number;
  arrivalTime: number;
  populationAtRisk: number;
  infrastructure: number;
}

export interface ReportItem {
  id: string;
  title: string;
  type: string;
  date: string;
  status: 'ready' | 'generating' | 'scheduled';
  size: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'degraded' | 'offline';
  lastSync: string;
  coverage: number;
}
