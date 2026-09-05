import type {
  KPICard,
  PipelineStage,
  AlertEvent,
  SafeLocation,
  EvacuationRoute,
  MapLayerConfig,
  ForecastPoint,
  FloodRiskPoint,
  ModelMetric,
  ConfidenceFactor,
  SimulationScenario,
  ReportItem,
  DataSource,
  InfrastructureItem,
} from '@/types';

// Pune region center
export const MAP_CENTER: [number, number] = [18.5204, 73.8567];
export const MAP_ZOOM = 12;

export const ALERT_BANNER = {
  level: 'red' as const,
  title: 'RED ALERT — SEVERE FLOOD RISK',
  description: 'Extreme rainfall and rapid inundation predicted',
  region: 'Pune Region',
  eta: '42 minutes',
};

export const KPIS_SEVERE: KPICard[] = [
  { id: 'rainfall', label: 'Rainfall', value: '92', unit: 'mm', sublabel: 'Next 3 Hours', trend: 24, trendDirection: 'up', icon: 'CloudRain', riskLevel: 'severe' },
  { id: 'flood-prob', label: 'Flood Probability', value: '89', unit: '%', sublabel: 'HIGH', trend: 15, trendDirection: 'up', icon: 'Waves', riskLevel: 'severe' },
  { id: 'water-depth', label: 'Water Depth', value: '1.42', unit: 'm', sublabel: 'Maximum predicted', trend: 12, trendDirection: 'up', icon: 'Meter', riskLevel: 'high' },
  { id: 'arrival', label: 'Flood Arrival', value: '42', unit: 'min', sublabel: 'Earliest predicted', trend: 8, trendDirection: 'down', icon: 'Timer', riskLevel: 'severe' },
  { id: 'population', label: 'Population at Risk', value: '24,680', sublabel: 'People', trend: 18, trendDirection: 'up', icon: 'Users', riskLevel: 'high' },
  { id: 'infrastructure', label: 'Infrastructure', value: '43', sublabel: 'Critical assets', trend: 5, trendDirection: 'up', icon: 'Building2', riskLevel: 'high' },
];

export const KPIS_NORMAL: KPICard[] = [
  { id: 'rainfall', label: 'Rainfall', value: '8', unit: 'mm', sublabel: 'Next 3 Hours', trend: 2, trendDirection: 'down', icon: 'CloudRain', riskLevel: 'low' },
  { id: 'flood-prob', label: 'Flood Probability', value: '8', unit: '%', sublabel: 'LOW', trend: 1, trendDirection: 'down', icon: 'Waves', riskLevel: 'low' },
  { id: 'water-depth', label: 'Water Depth', value: '0.12', unit: 'm', sublabel: 'Maximum predicted', trend: 0, trendDirection: 'down', icon: 'Meter', riskLevel: 'low' },
  { id: 'arrival', label: 'Flood Arrival', value: '—', sublabel: 'No flood expected', icon: 'Timer', riskLevel: 'low' },
  { id: 'population', label: 'Population at Risk', value: '0', sublabel: 'People', icon: 'Users', riskLevel: 'low' },
  { id: 'infrastructure', label: 'Infrastructure', value: '0', sublabel: 'Critical assets', icon: 'Building2', riskLevel: 'low' },
];

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'satellite', name: 'Satellite', status: 'complete', icon: 'Satellite' },
  { id: 'radar', name: 'Radar', status: 'complete', icon: 'Radar' },
  { id: 'observations', name: 'Observations', status: 'complete', icon: 'Eye' },
  { id: 'nwp', name: 'NWP', status: 'complete', icon: 'Cloud' },
  { id: 'fusion', name: 'Data Fusion', status: 'complete', icon: 'Combine' },
  { id: 'ai-model', name: 'AI Model', status: 'complete', icon: 'BrainCircuit' },
  { id: 'flood-model', name: 'Flood Model', status: 'processing', icon: 'Waves' },
  { id: 'risk-engine', name: 'Risk Engine', status: 'waiting', icon: 'ShieldAlert' },
  { id: 'alert', name: 'Alert', status: 'waiting', icon: 'Siren' },
];

export const ALERT_HISTORY: AlertEvent[] = [
  { id: 'a1', time: '18:42', level: 'red', title: 'RED ALERT', description: 'Flood risk critical — severe inundation predicted' },
  { id: 'a2', time: '18:35', level: 'orange', title: 'ORANGE ALERT', description: 'Heavy rainfall detected — flood probability rising' },
  { id: 'a3', time: '18:20', level: 'yellow', title: 'YELLOW ALERT', description: 'Rainfall increasing — monitoring conditions' },
  { id: 'a4', time: '18:00', level: 'green', title: 'GREEN', description: 'Normal conditions — all systems nominal' },
];

export const INFRASTRUCTURE: InfrastructureItem[] = [
  { id: 'h1', type: 'hospital', name: 'Sassoon General Hospital', count: 3, atRisk: 1, position: [18.5308, 73.8758] },
  { id: 'h2', type: 'school', name: 'Delhi Public School', count: 12, atRisk: 4, position: [18.5150, 73.8400] },
  { id: 'h3', type: 'bridge', name: 'Mula River Bridge', count: 7, atRisk: 3, position: [18.5250, 73.8500] },
  { id: 'h4', type: 'road', name: 'Aundh Road', count: 21, atRisk: 8, position: [18.5400, 73.8700] },
];

export const INFRASTRUCTURE_BREAKDOWN = [
  { type: 'Hospitals', count: 3, atRisk: 1, icon: 'Cross', color: 'text-risk-severe' },
  { type: 'Schools', count: 12, atRisk: 4, icon: 'GraduationCap', color: 'text-risk-high' },
  { type: 'Bridges', count: 7, atRisk: 3, icon: 'Construction', color: 'text-risk-moderate' },
  { type: 'Roads', count: 21, atRisk: 8, icon: 'Road', color: 'text-accent-400' },
];

export const SAFE_LOCATIONS: SafeLocation[] = [
  { id: 's1', name: 'Emergency Shelter A — Shivaji Nagar', distance: 2.4, capacity: 500, occupancy: 120, risk: 'low', travelTime: 8, position: [18.5320, 73.8440], address: 'Shivaji Nagar Community Hall, Pune' },
  { id: 's2', name: 'Shelter B — Kothrud', distance: 3.1, capacity: 800, occupancy: 200, risk: 'low', travelTime: 11, position: [18.5070, 73.8080], address: 'Kothrud Sports Complex, Pune' },
  { id: 's3', name: 'Shelter C — Baner', distance: 4.8, capacity: 1200, occupancy: 350, risk: 'low', travelTime: 16, position: [18.5590, 73.7760], address: 'Baner IT Park Hall, Pune' },
  { id: 's4', name: 'Shelter D — Hadapsar', distance: 5.6, capacity: 600, occupancy: 80, risk: 'moderate', travelTime: 19, position: [18.5080, 73.9290], address: 'Hadapsar Maidan, Pune' },
];

export const EVACUATION_ROUTES: EvacuationRoute[] = [
  {
    id: 'r1',
    name: 'Primary Safe Corridor (Via J.M. Road)',
    distance: 4.2,
    duration: 11,
    risk: 'low',
    routeType: 'recommended',
    destinationName: 'Shelter A — Shivaji Nagar Community Hall',
    destinationPos: [18.5320, 73.8440],
    path: [
      [18.5204, 73.8567],
      [18.5240, 73.8500],
      [18.5280, 73.8470],
      [18.5320, 73.8440],
    ],
    waypoints: [
      {
        id: 'wp-1-1',
        label: 'Start Point: Pune City Center',
        instruction: 'Head North-West on Shivaji Road towards elevated flyover',
        position: [18.5204, 73.8567],
        distanceFromStart: '0.0 km',
        safetyStatus: 'Nominal Ground Elevation',
      },
      {
        id: 'wp-1-2',
        label: 'Waypoint 1: J.M. Road Overpass',
        instruction: 'Turn slightly right onto J.M. Road. Flyover bypasses low bank inundation.',
        position: [18.5240, 73.8500],
        distanceFromStart: '1.4 km',
        safetyStatus: 'Elevated Corridor (+3.5m above river plane)',
      },
      {
        id: 'wp-1-3',
        label: 'Waypoint 2: Modern College Junction',
        instruction: 'Keep right on high-ground arterial away from river bank depression.',
        position: [18.5280, 73.8470],
        distanceFromStart: '2.8 km',
        safetyStatus: 'Dry Drainage Gradient',
      },
      {
        id: 'wp-1-4',
        label: 'Arrival: Shivaji Nagar Community Hall',
        instruction: 'Turn into designated safe shelter complex. Emergency relief teams active.',
        position: [18.5320, 73.8440],
        distanceFromStart: '4.2 km',
        safetyStatus: 'Designated Safe Zone · 850 Capacity',
      },
    ],
  },
  {
    id: 'r2',
    name: 'Alternative Corridor (Via Deccan Gymkhana)',
    distance: 5.1,
    duration: 14,
    risk: 'low',
    routeType: 'alternate',
    destinationName: 'Shelter A — Shivaji Nagar Community Hall',
    destinationPos: [18.5320, 73.8440],
    path: [
      [18.5204, 73.8567],
      [18.5160, 73.8600],
      [18.5120, 73.8520],
      [18.5150, 73.8450],
      [18.5320, 73.8440],
    ],
    waypoints: [
      {
        id: 'wp-2-1',
        label: 'Start Point: Pune City Center',
        instruction: 'Head South-West along Laxmi Road to bypass central water accumulation',
        position: [18.5204, 73.8567],
        distanceFromStart: '0.0 km',
        safetyStatus: 'Clear Roadway',
      },
      {
        id: 'wp-2-2',
        label: 'Waypoint 1: Alka Talkies Chowk',
        instruction: 'Cross Sambhaji Bridge connector towards Deccan ridge',
        position: [18.5160, 73.8600],
        distanceFromStart: '1.6 km',
        safetyStatus: 'Monitored River Crossing',
      },
      {
        id: 'wp-2-3',
        label: 'Waypoint 2: Deccan Gymkhana High Road',
        instruction: 'Take F.C. Road northward corridor on elevated basalt ridge',
        position: [18.5120, 73.8520],
        distanceFromStart: '3.1 km',
        safetyStatus: 'High Ground (+5.2m elevation)',
      },
      {
        id: 'wp-2-4',
        label: 'Waypoint 3: Fergusson College Link',
        instruction: 'Continue straight north toward Shivaji Nagar boundary',
        position: [18.5150, 73.8450],
        distanceFromStart: '4.2 km',
        safetyStatus: 'Zero Inundation Risk',
      },
      {
        id: 'wp-2-5',
        label: 'Arrival: Shivaji Nagar Community Hall',
        instruction: 'Arrive at designated emergency shelter gate',
        position: [18.5320, 73.8440],
        distanceFromStart: '5.1 km',
        safetyStatus: 'Designated Safe Zone · 850 Capacity',
      },
    ],
  },
  {
    id: 'r3',
    name: 'Southern High Ridge (To Kothrud Relief Center)',
    distance: 5.8,
    duration: 16,
    risk: 'low',
    routeType: 'alternate',
    destinationName: 'Shelter B — Kothrud Relief Center',
    destinationPos: [18.5050, 73.8120],
    path: [
      [18.5204, 73.8567],
      [18.5140, 73.8420],
      [18.5090, 73.8260],
      [18.5050, 73.8120],
    ],
    waypoints: [
      {
        id: 'wp-3-1',
        label: 'Start Point: Pune City Center',
        instruction: 'Proceed south-west on Lal Bahadur Shastri Road away from Mula River basin',
        position: [18.5204, 73.8567],
        distanceFromStart: '0.0 km',
        safetyStatus: 'Nominal Ground Elevation',
      },
      {
        id: 'wp-3-2',
        label: 'Waypoint 1: Karve Road Flyover',
        instruction: 'Ascend Karve Road flyover climbing above floodplain level',
        position: [18.5140, 73.8420],
        distanceFromStart: '1.9 km',
        safetyStatus: 'High Elevation Flyover',
      },
      {
        id: 'wp-3-3',
        label: 'Waypoint 2: Paud Phata High Ground',
        instruction: 'Continue west along Paud Road ridge avoiding valley depressions',
        position: [18.5090, 73.8260],
        distanceFromStart: '4.1 km',
        safetyStatus: 'Elevated Western Ridge',
      },
      {
        id: 'wp-3-4',
        label: 'Arrival: Kothrud Relief Center',
        instruction: 'Reach Kothrud Community Gymnasium Shelter. Medical aid stationed.',
        position: [18.5050, 73.8120],
        distanceFromStart: '5.8 km',
        safetyStatus: 'Designated Safe Zone · 600 Capacity',
      },
    ],
  },
];

export const BLOCKED_ROADS: [number, number][] = [
  [18.5220, 73.8620],
  [18.5180, 73.8520],
  [18.5260, 73.8720],
];

export const MAP_LAYERS: MapLayerConfig[] = [
  { id: 'rainfall', name: 'Rainfall Intensity', group: 'Weather', active: true, color: '#06b6d4' },
  { id: 'radar', name: 'Radar', group: 'Weather', active: false, color: '#0891b2' },
  { id: 'satellite', name: 'Satellite', group: 'Weather', active: false, color: '#64748b' },
  { id: 'flood-extent', name: 'Flood Extent', group: 'Prediction', active: true, color: '#ef4444' },
  { id: 'water-depth', name: 'Water Depth', group: 'Prediction', active: false, color: '#f97316' },
  { id: 'flood-arrival', name: 'Flood Arrival', group: 'Prediction', active: false, color: '#eab308' },
  { id: 'population', name: 'Population', group: 'Risk', active: false, color: '#a855f7' },
  { id: 'infrastructure', name: 'Infrastructure', group: 'Risk', active: true, color: '#3b82f6' },
  { id: 'vulnerable', name: 'Vulnerable Areas', group: 'Risk', active: false, color: '#f97316' },
  { id: 'safe-locations', name: 'Safe Locations', group: 'Response', active: true, color: '#22c55e' },
  { id: 'evacuation', name: 'Evacuation Routes', group: 'Response', active: true, color: '#22c55e' },
];

export function generateForecast(baseRain: number, hours: number): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  for (let i = 0; i <= hours; i++) {
    const time = i === 0 ? 'Now' : `+${i}h`;
    const wave = Math.sin(i / 3) * 8 + Math.cos(i / 5) * 5;
    const predicted = Math.max(0, baseRain + wave + (i < 3 ? i * 6 : (hours - i) * 0.5));
    const observed = i <= 1 ? Math.max(0, predicted - 3 + Math.random() * 6) : null;
    const confidence = 15 - i * 1.5;
    points.push({
      time,
      hour: i,
      observed,
      predicted: Math.round(predicted * 10) / 10,
      confidenceUpper: Math.round((predicted + confidence) * 10) / 10,
      confidenceLower: Math.max(0, Math.round((predicted - confidence) * 10) / 10),
    });
  }
  return points;
}

export const RAINFALL_NOWCAST: ForecastPoint[] = generateForecast(35, 6);
export const RAINFALL_SHORT_TERM: ForecastPoint[] = generateForecast(40, 72);

export const CUMULATIVE_RAINFALL = RAINFALL_NOWCAST.map((p) => ({
  time: p.time,
  hour: p.hour,
  value: Math.round(RAINFALL_NOWCAST.slice(0, p.hour + 1).reduce((s, x) => s + x.predicted, 0) * 10) / 10,
}));

export const RAINFALL_PROBABILITY = RAINFALL_NOWCAST.map((p) => ({
  time: p.time,
  hour: p.hour,
  value: Math.min(98, Math.round(30 + p.predicted * 1.5)),
}));

export const FLOOD_RISK_TIMELINE: FloodRiskPoint[] = [
  { time: 'NOW', hour: 0, level: 'low', probability: 8, label: 'LOW' },
  { time: '+1H', hour: 1, level: 'moderate', probability: 31, label: 'MODERATE' },
  { time: '+2H', hour: 2, level: 'high', probability: 67, label: 'HIGH' },
  { time: '+3H', hour: 3, level: 'severe', probability: 89, label: 'SEVERE' },
];

export const MODEL_METRICS: ModelMetric[] = [
  { label: 'Accuracy', value: 92, unit: '%' },
  { label: 'Precision', value: 89, unit: '%' },
  { label: 'Recall', value: 91, unit: '%' },
  { label: 'F1 Score', value: 90, unit: '%' },
  { label: 'False Alarm Rate', value: 8, unit: '%' },
  { label: 'Lead Time', value: 48, unit: 'min' },
];

export const CONFIDENCE_FACTORS: ConfidenceFactor[] = [
  { label: 'Rainfall Accumulation', percentage: 35, color: '#06b6d4' },
  { label: 'Radar Intensity', percentage: 24, color: '#0891b2' },
  { label: 'NWP Forecast', percentage: 18, color: '#0e7490' },
  { label: 'Elevation', percentage: 12, color: '#3b82f6' },
  { label: 'Drainage', percentage: 7, color: '#6366f1' },
  { label: 'Historical Flood Risk', percentage: 4, color: '#8b5cf6' },
];

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'normal',
    name: 'Normal',
    description: 'Baseline conditions — no significant rainfall',
    phases: [
      { level: 'green', label: 'Normal', floodProbability: 8, rainfall: 8, waterDepth: 0.12, arrivalTime: 0, populationAtRisk: 0, infrastructure: 0 },
    ],
  },
  {
    id: 'heavy',
    name: 'Heavy Rainfall',
    description: 'Sustained heavy rainfall event',
    phases: [
      { level: 'green', label: 'Normal', floodProbability: 8, rainfall: 12, waterDepth: 0.15, arrivalTime: 0, populationAtRisk: 0, infrastructure: 0 },
      { level: 'yellow', label: 'Moderate', floodProbability: 31, rainfall: 45, waterDepth: 0.45, arrivalTime: 90, populationAtRisk: 5200, infrastructure: 12 },
    ],
  },
  {
    id: 'extreme',
    name: 'Extreme Rainfall',
    description: 'Extreme rainfall with severe flood risk',
    phases: [
      { level: 'green', label: 'Normal', floodProbability: 8, rainfall: 12, waterDepth: 0.15, arrivalTime: 0, populationAtRisk: 0, infrastructure: 0 },
      { level: 'yellow', label: 'Moderate', floodProbability: 31, rainfall: 45, waterDepth: 0.45, arrivalTime: 90, populationAtRisk: 5200, infrastructure: 12 },
      { level: 'orange', label: 'High', floodProbability: 67, rainfall: 68, waterDepth: 0.85, arrivalTime: 65, populationAtRisk: 14800, infrastructure: 27 },
      { level: 'red', label: 'Severe', floodProbability: 89, rainfall: 92, waterDepth: 1.42, arrivalTime: 42, populationAtRisk: 24680, infrastructure: 43 },
    ],
  },
  {
    id: 'urban',
    name: 'Urban Flood',
    description: 'Urban drainage overflow scenario',
    phases: [
      { level: 'green', label: 'Normal', floodProbability: 8, rainfall: 10, waterDepth: 0.10, arrivalTime: 0, populationAtRisk: 0, infrastructure: 0 },
      { level: 'yellow', label: 'Moderate', floodProbability: 28, rainfall: 38, waterDepth: 0.35, arrivalTime: 75, populationAtRisk: 3800, infrastructure: 8 },
      { level: 'orange', label: 'High', floodProbability: 58, rainfall: 55, waterDepth: 0.65, arrivalTime: 55, populationAtRisk: 11200, infrastructure: 22 },
    ],
  },
  {
    id: 'flash',
    name: 'Flash Flood',
    description: 'Rapid-onset flash flood event',
    phases: [
      { level: 'green', label: 'Normal', floodProbability: 8, rainfall: 15, waterDepth: 0.12, arrivalTime: 0, populationAtRisk: 0, infrastructure: 0 },
      { level: 'yellow', label: 'Moderate', floodProbability: 35, rainfall: 52, waterDepth: 0.55, arrivalTime: 60, populationAtRisk: 4500, infrastructure: 10 },
      { level: 'orange', label: 'High', floodProbability: 72, rainfall: 78, waterDepth: 1.05, arrivalTime: 38, populationAtRisk: 16200, infrastructure: 31 },
      { level: 'red', label: 'Severe', floodProbability: 94, rainfall: 110, waterDepth: 1.75, arrivalTime: 22, populationAtRisk: 31000, infrastructure: 52 },
    ],
  },
];

export const REPORTS: ReportItem[] = [
  { id: 'r1', title: 'Heavy Rainfall Report', type: 'Weather', date: '2026-09-03', status: 'ready', size: '2.4 MB' },
  { id: 'r2', title: 'Flood Risk Assessment', type: 'Prediction', date: '2026-09-03', status: 'ready', size: '4.1 MB' },
  { id: 'r3', title: 'Emergency Incident Report', type: 'Response', date: '2026-09-03', status: 'generating', size: '—' },
  { id: 'r4', title: 'Evacuation Report', type: 'Response', date: '2026-09-02', status: 'ready', size: '1.8 MB' },
  { id: 'r5', title: 'Model Performance Report', type: 'AI', date: '2026-09-01', status: 'ready', size: '3.2 MB' },
  { id: 'r6', title: 'Monthly Flood Analysis', type: 'Prediction', date: '2026-08-31', status: 'scheduled', size: '—' },
];

export const DATA_SOURCES: DataSource[] = [
  { id: 'insat', name: 'INSAT-3DR Satellite', type: 'Satellite', status: 'online', lastSync: '2 min ago', coverage: 98 },
  { id: 'imdradar', name: 'IMD Doppler Radar', type: 'Radar', status: 'online', lastSync: '1 min ago', coverage: 95 },
  { id: 'aws', name: 'Automatic Weather Stations', type: 'Observation', status: 'online', lastSync: '3 min ago', coverage: 92 },
  { id: 'wrf', name: 'WRF NWP Model', type: 'NWP', status: 'online', lastSync: '15 min ago', coverage: 88 },
  { id: 'gpm', name: 'GPM Satellite', type: 'Satellite', status: 'degraded', lastSync: '22 min ago', coverage: 71 },
  { id: 'river', name: 'River Gauge Network', type: 'Observation', status: 'online', lastSync: '5 min ago', coverage: 84 },
];

export const MODEL_HISTORY = Array.from({ length: 12 }, (_, i) => ({
  month: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][i],
  accuracy: 85 + Math.round(Math.random() * 10),
  precision: 82 + Math.round(Math.random() * 10),
  recall: 84 + Math.round(Math.random() * 10),
}));

export const POPULATION_RISK = [
  { level: 'Severe', count: 24680, color: '#ef4444' },
  { level: 'High', count: 18200, color: '#f97316' },
  { level: 'Moderate', count: 35400, color: '#eab308' },
  { level: 'Low', count: 128000, color: '#22c55e' },
];

export const AREA_RISK = [
  { level: 'Severe', area: 12.4, color: '#ef4444' },
  { level: 'High', area: 18.7, color: '#f97316' },
  { level: 'Moderate', area: 24.2, color: '#eab308' },
  { level: 'Low', area: 45.8, color: '#22c55e' },
];

// GeoJSON for flood polygons around Pune rivers
export const FLOOD_POLYGONS = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { depth: 1.4, risk: 'severe' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [73.845, 18.515], [73.855, 18.518], [73.862, 18.522], [73.868, 18.528],
          [73.865, 18.535], [73.858, 18.538], [73.850, 18.536], [73.842, 18.530],
          [73.840, 18.522], [73.845, 18.515],
        ]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { depth: 0.8, risk: 'high' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [73.835, 18.510], [73.845, 18.513], [73.852, 18.516], [73.848, 18.525],
          [73.838, 18.528], [73.830, 18.522], [73.828, 18.515], [73.835, 18.510],
        ]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { depth: 0.5, risk: 'moderate' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [73.870, 18.540], [73.880, 18.543], [73.885, 18.548], [73.882, 18.555],
          [73.875, 18.558], [73.868, 18.553], [73.865, 18.545], [73.870, 18.540],
        ]],
      },
    },
  ],
};

// Rainfall heatmap circles
export const RAINFALL_CIRCLES = [
  { center: [18.5204, 73.8567] as [number, number], radius: 800, intensity: 92 },
  { center: [18.5300, 73.8500] as [number, number], radius: 600, intensity: 78 },
  { center: [18.5100, 73.8600] as [number, number], radius: 500, intensity: 65 },
  { center: [18.5400, 73.8700] as [number, number], radius: 700, intensity: 84 },
  { center: [18.5000, 73.8450] as [number, number], radius: 450, intensity: 52 },
  { center: [18.5500, 73.8800] as [number, number], radius: 550, intensity: 48 },
];

export const TIMELINE_MARKERS = [
  { hour: 0, label: 'NOW' },
  { hour: 1, label: '1H' },
  { hour: 2, label: '2H' },
  { hour: 3, label: '3H' },
  { hour: 6, label: '6H' },
  { hour: 12, label: '12H' },
  { hour: 24, label: '24H' },
];
