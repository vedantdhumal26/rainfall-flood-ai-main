import { AlertTriangle, MapPin, Clock, ArrowRight } from 'lucide-react';

interface AlertBannerProps {
  title: string;
  description: string;
  region: string;
  eta: string;
  onViewPlan?: () => void;
}

export function AlertBanner({ title, description, region, eta, onViewPlan }: AlertBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-risk-severe/40 bg-gradient-to-r from-risk-severe/15 via-risk-severe/8 to-transparent animate-slide-up">
      {/* Pulsing left border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-risk-severe animate-pulse-slow"></div>

      <div className="flex items-center gap-4 px-5 py-4">
        {/* Pulsing icon */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-risk-severe/30 animate-pulse-ring"></div>
          <div className="relative w-12 h-12 rounded-full bg-risk-severe/20 border border-risk-severe/40 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-risk-severe" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-risk-severe tracking-wider uppercase">{title}</h2>
          <p className="text-sm text-slate-300 mt-0.5">{description}</p>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <MapPin className="w-3 h-3" />
              {region}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" />
              Expected within {eta}
            </span>
          </div>
        </div>

        <button
          onClick={onViewPlan}
          className="btn btn-danger shrink-0 hidden sm:inline-flex"
        >
          View Response Plan
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
