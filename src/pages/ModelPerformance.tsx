import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import { MODEL_METRICS, MODEL_HISTORY } from '@/data/mockData';
import { Cpu, TrendingUp, RefreshCw, Check, Loader2, Brain } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

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
  { label: 'Collecting Ground Truth', icon: 'Database' },
  { label: 'Validating Data', icon: 'CheckCircle' },
  { label: 'Training Model', icon: 'Brain' },
  { label: 'Evaluating', icon: 'Target' },
  { label: 'Model Updated', icon: 'CheckCircle' },
];

export function ModelPerformance() {
  const [retraining, setRetraining] = useState(false);
  const [retrainStep, setRetrainStep] = useState(-1);

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
        <h1 className="text-2xl font-bold text-white tracking-tight">Model Performance</h1>
        <p className="text-sm text-slate-500 mt-1">AI model accuracy, precision, and historical performance metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {MODEL_METRICS.map((metric) => (
          <MetricGauge key={metric.label} label={metric.label} value={metric.value} unit={metric.unit} />
        ))}
      </div>

      {/* Historical Performance */}
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="panel-title">Historical Model Performance</h3>
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
            <h3 className="panel-title">Model Retraining</h3>
            <Cpu className="w-4 h-4 text-accent-400" />
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Retrain the AI model with the latest ground truth data and observations. This process collects new data, validates it, trains the model, and evaluates performance before deploying.
          </p>

          {/* Retrain Pipeline */}
          <div className="space-y-2 mb-4">
            {RETRAIN_STAGES.map((stage, idx) => {
              const isDone = retrainStep > idx;
              const isCurrent = retrainStep === idx;
              const isPending = retrainStep < idx;
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
                Retraining...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Retrain Model
              </>
            )}
          </button>
        </div>

        {/* Model Info */}
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="panel-title">Model Information</h3>
            <Brain className="w-4 h-4 text-accent-400" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Model Version', value: 'v4.2.1' },
              { label: 'Architecture', value: 'Transformer + CNN' },
              { label: 'Training Data', value: '2.4M samples' },
              { label: 'Last Trained', value: '2026-08-28' },
              { label: 'Inference Time', value: '1.2 seconds' },
              { label: 'Input Sources', value: '6 integrated' },
              { label: 'Prediction Horizon', value: '72 hours' },
              { label: 'Update Frequency', value: 'Every 15 min' },
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
