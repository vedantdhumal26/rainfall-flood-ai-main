import { useState, useEffect } from 'react';
import { REPORTS as FALLBACK_REPORTS } from '@/data/mockData';
import { FileText, Eye, Download, Plus, FileBarChart, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { reportsApi } from '@/api/reports';
import type { ReportItem } from '@/types';

export function Reports() {
  const [reports, setReports] = useState<ReportItem[]>(FALLBACK_REPORTS);
  const [generatingTitle, setGeneratingTitle] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReports = () => {
    reportsApi.getReports()
      .then((data) => {
        if (data && data.length > 0) setReports(data);
      })
      .catch((err) => console.warn('[Reports] Fallback reports list:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async (title: string, type: string) => {
    setGeneratingTitle(title);
    try {
      await reportsApi.generateReport(title, type);
      setSuccessMsg(`Generated "${title}" successfully.`);
      loadReports();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: unknown) {
      alert((e as Error).message || 'Failed to generate report');
    } finally {
      setGeneratingTitle(null);
    }
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Intelligence Reports & Assessments</h1>
        <p className="text-sm text-slate-500 mt-1">Generate, audit, and export meteorological and flood damage intelligence reports</p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-risk-low/15 border border-risk-low/30 text-xs text-risk-low flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quick Generate Cards calling Backend API */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { title: 'Flood Risk Assessment', desc: 'Comprehensive catchment risk analysis', type: 'Prediction', icon: FileBarChart },
          { title: 'Emergency Incident Report', desc: 'Log active response incidents and damages', type: 'Response', icon: FileText },
          { title: 'Evacuation Shelter Log', desc: 'Audit shelter capacity and relief supplies', type: 'Response', icon: FileText },
        ].map((item) => {
          const Icon = item.icon;
          const isGen = generatingTitle === item.title;
          return (
            <div key={item.title} className="panel p-4 hover:border-white/10 transition-all group cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-accent-500/10 border border-accent-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-accent-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-200">{item.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  <button
                    onClick={() => handleGenerate(item.title, item.type)}
                    disabled={isGen}
                    className="btn btn-primary mt-3 py-1.5 text-xs w-full flex items-center justify-center gap-1.5"
                  >
                    {isGen ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    {isGen ? 'Generating...' : 'Generate Live Report'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reports Table from Backend */}
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="panel-title">Repository of Generated Reports</h3>
          <span className="text-[11px] text-slate-500">{reports.length} total reports available</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Report Title</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Generated On</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Size</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-200">{report.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <span className="badge bg-accent-500/10 text-accent-300 border border-accent-500/20">{report.type}</span>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <span className="text-xs text-slate-400 font-mono">{report.date}</span>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <span className="text-xs text-slate-400 tabular-nums">{report.size}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`badge ${
                        report.status === 'ready'
                          ? 'bg-risk-low/15 text-risk-low'
                          : report.status === 'generating'
                            ? 'bg-accent-500/15 text-accent-300'
                            : 'bg-slate-500/15 text-slate-400'
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => alert(`Viewing report: ${report.title} (${report.size})`)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-accent-300 hover:bg-white/5 transition-colors"
                        title="View Report"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => alert(`Downloading report: ${report.title}`)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-risk-low hover:bg-white/5 transition-colors"
                        title="Export File"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="panel p-4">
        <h3 className="panel-title mb-3">Automated Scheduled Reports</h3>
        <div className="space-y-2">
          {[
            { name: 'Daily Regional Flood Summary', schedule: 'Every day at 06:00 IST', icon: Calendar },
            { name: 'Weekly AI Model Accuracy & Drift Audit', schedule: 'Every Monday at 08:00 IST', icon: Calendar },
            { name: 'Monthly Hydrological Inundation Synthesis', schedule: '1st of every month at 00:00 IST', icon: Calendar },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="flex items-center justify-between p-2.5 rounded-md bg-white/3 border border-white/5">
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.schedule}</div>
                  </div>
                </div>
                <span className="badge bg-risk-low/15 text-risk-low">Active Schedule</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
