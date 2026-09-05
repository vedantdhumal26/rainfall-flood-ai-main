import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import { MODEL_METRICS as FALLBACK_METRICS, MODEL_HISTORY } from '@/data/mockData';
import { Cpu, RefreshCw, Check, Loader2, Brain } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { predictionsApi } from '@/api/predictions';
import type { ModelMetric } from '@/types';

function MetricGauge({ label, value, unit }: { label: string; value: number; unit?: string }) {
  const animated = useCountUp(value, 700);
  const data = [{ name: label, value: animated, fill: value >= 85 ? '#22c55e' : value >= 70 ? '#eab308' : '#ef4444' }];
  return (
    <div className="panel p-4 text-center">
      <div className="relative w-32 h-32 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: 'rgba(255,255,255,0.04)' }} dataKey="value" cornerRadius={8} angleAxisId={0} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white tabular-nums">{Math.round(animated)}{unit}</span>
        </div>
      </div>
      <div className="stat-label mt-2">{label}</div>
    </div>
  );
}

const RETRAIN_STAGES = [
  { label: 'Collecting Ground Truth Telemetry', icon: 'Database' },
  { label: 'Validating Quality Control Flags', icon: 'CheckCircle' },
  { label: 'Hydrological Neural Retraining', icon: 'Brain' },
  { label: 'Evaluating Inundation Metrics', icon: 'Target' },
  { label: 'Model Weights Synchronized', icon: 'CheckCircle' },
];

export function ModelPerformance() {
  const [metrics, setMetrics] = useState<ModelMetric[]>(FALLBACK_METRICS);
  const [retraining, setRetraining] = useState(false);
  const [retrainStep, setRetrainStep] = useState(-1);

  useEffect(() => {
    let isMounted = true;
    predictionsApi.getMetrics()
      .then((res) => {
        if (isMounted && res?.metrics && res.metrics.length > 0) {
          setMetrics(res.metrics);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetrain = () => {
    setRetraining(true);
    setRetrainStep(0);
    const interval = setInterval(() => {
      setRetrainStep((prev) => {
        if (prev >= RETRAIN_STAGES.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setRetraining(false);
            setRetrainStep(-1);
          }, 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Model Performance & Validation</h1>
        <p className="text-sm text-slate-500 mt-1">AI model accuracy, F1 score, precision, and historical benchmark evaluations</p>
      </div>

      {/* Metrics Grid from Backend API */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((metric) => (
          <MetricGauge key={metric.label} label={metric.label} value={metric.value} unit={metric.unit} />
        ))}
      </div>

      {/* Historical Performance */}
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="panel-title">Historical Model Performance Trend</h3>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-1 rounded-full bg-risk-low"></span> Accuracy
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-1 rounded-full bg-accent-400"></span> Precision
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-1 rounded-full bg-risk-moderate"></span> Recall
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={MODEL_HISTORY} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[75, 100]} />
            <Tooltip
              contentStyle={{ background: '#111a30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: '#22c55e' }} name="Accuracy" />
            <Line type="monotone" dataKey="precision" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3, fill: '#06b6d4' }} name="Precision" />
            <Line type="monotone" dataKey="recall" stroke="#eab308" strokeWidth={2.5} dot={{ r: 3, fill: '#eab308' }} name="Recall" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Retraining Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="panel-title">Model Calibration & Fine-Tuning</h3>
            <Cpu className="w-4 h-4 text-accent-400" />
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Trigger retraining with real-time ground truth gauge telemetry. The pipeline cleans outliers, aligns DEM elevation grids, and updates weights.
          </p>

          {/* Retrain Pipeline */}
          <div className="space-y-2 mb-4">
            {RETRAIN_STAGES.map((stage, idx) => {
              const isDone = retrainStep > idx;
              const isCurrent = retrainStep === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2.5 rounded-md border transition-all ${
                    isCurrent ? 'bg-accent-500/10 border-accent-500/30' :
                    isDone ? 'bg-risk-low/5 border-risk-low/20' :
                    'bg-white/3 border-white/5'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isDone ? 'bg-risk-low/20' : isCurrent ? 'bg-accent-500/20' : 'bg-white/5'
                  }`}>
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 text-risk-low" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 text-accent-400 animate-spin" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    )}
                  </div>
                  <span className={`text-xs ${isDone ? 'text-slate-400' : isCurrent ? 'text-accent-300 font-semibold' : 'text-slate-600'}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="btn btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {retraining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Retraining Neural Pipeline...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Trigger Model Retraining
              </>
            )}
          </button>
        </div>

        {/* Model Info */}
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="panel-title">Model Specifications</h3>
            <Brain className="w-4 h-4 text-accent-400" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Active Checkpoint', value: 'RainShield-FloodNet-v1.0' },
              { label: 'Architecture', value: 'Physics-Informed Neural Network (PINN) + XGBoost' },
              { label: 'Calibration Dataset', value: '2.4M observations (2018–2025)' },
              { label: 'Last Checkpoint Update', value: '2026-09-05' },
              { label: 'Inference Execution Latency', value: '1.1 seconds' },
              { label: 'Fused Telemetry Inputs', value: 'Station, Radar, INSAT-3DR, NWP, Gauges' },
              { label: 'Nowcast Horizon', value: '0–6h Nowcast / 72h Forecast' },
              { label: 'Spatial Resolution', value: '0.05° x 0.05° Uniform Grid' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/3">
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className="text-xs font-semibold text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
