import type { RiskLevel, AlertLevel } from '@/types';

export function riskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: '#22c55e',
    moderate: '#eab308',
    high: '#f97316',
    severe: '#ef4444',
  };
  return colors[level];
}

export function riskBgClass(level: RiskLevel): string {
  const classes: Record<RiskLevel, string> = {
    low: 'bg-risk-low/15 text-risk-low border-risk-low/30',
    moderate: 'bg-risk-moderate/15 text-risk-moderate border-risk-moderate/30',
    high: 'bg-risk-high/15 text-risk-high border-risk-high/30',
    severe: 'bg-risk-severe/15 text-risk-severe border-risk-severe/30',
  };
  return classes[level];
}

export function riskTextClass(level: RiskLevel): string {
  const classes: Record<RiskLevel, string> = {
    low: 'text-risk-low',
    moderate: 'text-risk-moderate',
    high: 'text-risk-high',
    severe: 'text-risk-severe',
  };
  return classes[level];
}

export function alertColor(level: AlertLevel): string {
  const colors: Record<AlertLevel, string> = {
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    red: '#ef4444',
  };
  return colors[level];
}

export function alertBgClass(level: AlertLevel): string {
  const classes: Record<AlertLevel, string> = {
    green: 'bg-risk-low/15 text-risk-low border-risk-low/30',
    yellow: 'bg-risk-moderate/15 text-risk-moderate border-risk-moderate/30',
    orange: 'bg-risk-high/15 text-risk-high border-risk-high/30',
    red: 'bg-risk-severe/15 text-risk-severe border-risk-severe/30',
  };
  return classes[level];
}

export function alertLabel(level: AlertLevel): string {
  const labels: Record<AlertLevel, string> = {
    green: 'GREEN',
    yellow: 'YELLOW',
    orange: 'ORANGE',
    red: 'RED',
  };
  return labels[level];
}

export function riskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: 'LOW',
    moderate: 'MODERATE',
    high: 'HIGH',
    severe: 'SEVERE',
  };
  return labels[level];
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}
