import { MapContainer, TileLayer, CircleMarker, Polygon, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { Plus, Minus, Layers, Search, X, Loader2 } from 'lucide-react';
import { MAP_CENTER, MAP_ZOOM, BLOCKED_ROADS, MAP_LAYERS, EVACUATION_ROUTES } from '@/data/mockData';
import type { MapLayerConfig, SafeLocation } from '@/types';
import { riskZonesApi, type GeoJsonFeatureCollection } from '@/api/riskZones';
import { rainfallApi, type RainfallCircle } from '@/api/rainfall';
import { responseApi } from '@/api/response';

// Fix default marker icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function getRiskColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case 'critical':
    case 'severe':
      return '#ef4444'; // red
    case 'high':
    case 'warning':
      return '#f97316'; // orange
    case 'moderate':
    case 'watch':
      return '#eab308'; // yellow
    case 'low':
    default:
      return '#22c55e'; // green
  }
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1 pointer-events-auto">
      <button
        onClick={() => map.zoomIn()}
        className="w-8 h-8 rounded-md bg-base-800/90 border border-white/10 flex items-center justify-center text-accent-300 hover:bg-base-750 transition-colors backdrop-blur-sm"
        title="Zoom in"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-8 h-8 rounded-md bg-base-800/90 border border-white/10 flex items-center justify-center text-accent-300 hover:bg-base-750 transition-colors backdrop-blur-sm"
        title="Zoom out"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
}

function FlyToController({ focusTarget }: { focusTarget?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (focusTarget) {
      map.flyTo(focusTarget, 14, { duration: 1.2 });
    }
  }, [focusTarget, map]);
  return null;
}

function LiveIndicator() {
  return (
    <div className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-base-800/90 border border-risk-severe/30 backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-severe opacity-60"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-severe"></span>
      </span>
      <span className="text-[10px] font-bold text-risk-severe tracking-wider">LIVE FEED</span>
    </div>
  );
}

function Legend() {
  return (
    <div className="absolute bottom-3 left-3 z-[1000] px-3 py-2.5 rounded-md bg-base-800/90 border border-white/10 backdrop-blur-sm">
      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Map Risk Legend</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {[
          { label: 'Critical / Severe', color: '#ef4444' },
          { label: 'High / Warning', color: '#f97316' },
          { label: 'Moderate / Watch', color: '#eab308' },
          { label: 'Low / Safe', color: '#22c55e' },
          { label: 'Rainfall Heatmap', color: '#06b6d4' },
          { label: 'Evacuation Route', color: '#22c55e' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span className="text-[10px] text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchBox() {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] hidden md:block">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-base-800/90 border border-white/10 backdrop-blur-sm w-64">
        <Search className="w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search Pune ward or zone..."
          className="bg-transparent text-xs text-slate-300 placeholder:text-slate-600 outline-none flex-1"
        />
      </div>
    </div>
  );
}

function LayerSwitcher({ layers, onToggle }: { layers: MapLayerConfig[]; onToggle: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const groups = ['Weather', 'Prediction', 'Risk', 'Response'] as const;

  return (
    <div className="absolute top-3 right-3 z-[1000] pointer-events-auto">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-base-800/90 border border-white/10 backdrop-blur-sm text-slate-300 hover:bg-base-750 transition-colors"
      >
        <Layers className="w-4 h-4 text-accent-400" />
        <span className="text-xs font-medium">Layers</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[999]" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1 w-60 rounded-lg bg-base-800 border border-white/10 shadow-xl z-[1001] animate-fade-in">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
              <span className="text-xs font-semibold text-slate-200">GIS Layers</span>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3 max-h-80 overflow-y-auto">
              {groups.map((group) => (
                <div key={group} className="mb-3 last:mb-0">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{group}</div>
                  <div className="space-y-1">
                    {layers.filter((l) => l.group === group).map((layer) => (
                      <button
                        key={layer.id}
                        onClick={() => onToggle(layer.id)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            layer.active ? 'bg-accent-500/30 border-accent-500/50' : 'border-white/15'
                          }`}
                        >
                          {layer.active && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke={layer.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="w-2 h-2 rounded-full" style={{ background: layer.color }} />
                        <span className={`text-[11px] ${layer.active ? 'text-slate-200' : 'text-slate-400'}`}>{layer.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface MapViewProps {
  height?: string;
  showControls?: boolean;
  showSearch?: boolean;
  focusTarget?: [number, number] | null;
  className?: string;
}

export function MapView({ height = '100%', showControls = true, showSearch = true, focusTarget, className = '' }: MapViewProps) {
  const [layers, setLayers] = useState<MapLayerConfig[]>(MAP_LAYERS);
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonFeatureCollection | null>(null);
  const [rainfallCircles, setRainfallCircles] = useState<RainfallCircle[]>([]);
  const [shelters, setShelters] = useState<SafeLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const toggleLayer = (id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l)));
  };

  const getLayer = (id: string) => layers.find((l) => l.id === id)?.active ?? false;

  // Load live GIS data from backend APIs
  useEffect(() => {
    let isMounted = true;
    const fetchGisData = async () => {
      try {
        const [geoRes, rainRes, shelterRes] = await Promise.all([
          riskZonesApi.getGeoJson().catch(() => null),
          rainfallApi.getCurrent().catch(() => null),
          responseApi.getShelters().catch(() => null),
        ]);

        if (!isMounted) return;

        if (geoRes && geoRes.features) {
          setGeoJsonData(geoRes);
        }
        if (rainRes && rainRes.rainfall_circles) {
          setRainfallCircles(rainRes.rainfall_circles);
        }
        if (shelterRes && Array.isArray(shelterRes)) {
          setShelters(shelterRes);
        }
      } catch (e) {
        console.warn('[MapView] Using local GIS cache fallback:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchGisData();
    const interval = setInterval(fetchGisData, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && !geoJsonData && (
        <div className="absolute inset-0 z-[1002] bg-base-950/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-xs text-accent-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading GIS Risk Polygons...
          </div>
        </div>
      )}

      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        className="w-full h-full rounded-lg"
        zoomControl={false}
        attributionControl={true}
        style={{ background: '#0a1020' }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, FAO, NOAA, USGS, EPA'
        />

        <FlyToController focusTarget={focusTarget} />
        {showControls && <ZoomControls />}

        {/* Dynamic Rainfall heatmap circles from Backend API */}
        {getLayer('rainfall') &&
          rainfallCircles.map((circle, idx) => (
            <CircleMarker
              key={`rain-${idx}`}
              center={circle.center}
              radius={Math.max(8, circle.intensity / 6)}
              pathOptions={{
                color: '#06b6d4',
                fillColor: '#06b6d4',
                fillOpacity: Math.min(0.4, circle.intensity / 200),
                weight: 1,
              }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold text-accent-300">Rainfall Station / Cell</div>
                  <div className="text-slate-400 mt-1">Intensity: {circle.intensity} mm/h</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* Dynamic GeoJSON Flood risk polygons from Backend API */}
        {(getLayer('flood-extent') || getLayer('water-depth')) &&
          geoJsonData?.features.map((feature, idx) => {
            const risk = (feature.properties.risk || 'moderate') as string;
            const color = getRiskColor(risk);
            const positions = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]) as [number, number][];

            return (
              <Polygon
                key={`flood-geo-${feature.id || idx}`}
                positions={positions}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.28,
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-semibold uppercase tracking-wider" style={{ color }}>
                      {risk} Inundation Zone
                    </div>
                    <div className="text-slate-300 mt-1 font-medium">{feature.properties.name || 'Riverbank Lowland'}</div>
                    <div className="text-slate-400">Water Depth: {feature.properties.water_depth || feature.properties.depth || 0.5} m</div>
                    {feature.properties.flood_probability !== undefined && (
                      <div className="text-slate-400">Probability: {feature.properties.flood_probability}%</div>
                    )}
                  </div>
                </Popup>
              </Polygon>
            );
          })}

        {/* Dynamic Safe locations from Backend API */}
        {getLayer('safe-locations') &&
          shelters.map((loc) => (
            <Marker key={loc.id} position={loc.position || [loc.lat ?? 18.52, loc.lon ?? 73.85]}>
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold text-risk-low">{loc.name}</div>
                  <div className="text-slate-400 mt-1">Address: {loc.address}</div>
                  <div className="text-slate-400">Capacity: {loc.capacity} (Occupancy: {loc.occupancy})</div>
                  <div className="text-slate-400">Distance: {loc.distance} km</div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Evacuation routes */}
        {getLayer('evacuation') &&
          EVACUATION_ROUTES.map((route) => (
            <Polyline
              key={route.id}
              positions={route.path}
              pathOptions={{
                color: route.routeType === 'recommended' ? '#22c55e' : '#06b6d4',
                weight: 4,
                opacity: 0.75,
                dashArray: route.routeType === 'alternate' ? '10 6' : undefined,
              }}
            />
          ))}

        {/* Blocked roads */}
        {BLOCKED_ROADS.map((pos, idx) => (
          <CircleMarker
            key={`blocked-${idx}`}
            center={pos}
            radius={6}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6, weight: 1 }}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-semibold text-risk-severe">Blocked Roadway</div>
                <div className="text-slate-400 mt-1">Impassable due to rising flood water</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {showSearch && <SearchBox />}
      {showControls && <LayerSwitcher layers={layers} onToggle={toggleLayer} />}
      {showControls && <Legend />}
      {showControls && <LiveIndicator />}
    </div>
  );
}
