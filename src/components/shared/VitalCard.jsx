import { cn } from '@/lib/utils';

const vitalConfig = {
  ph: { label: 'pH Level', unit: '', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  temperature: { label: 'Temperature', unit: '°C', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  pulse: { label: 'Pulse', unit: 'bpm', color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  spo2: { label: 'SpO2', unit: '%', color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
};

export default function VitalCard({ type, value, baseline, deviation, icon: Icon }) {
  const config = vitalConfig[type] || vitalConfig.ph;
  const deviationNum = parseFloat(deviation) || 0;
  const isElevated = deviationNum > 5;

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all",
      isElevated ? "border-red-200 bg-red-50/50" : "border-border bg-card"
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {config.label}
        </span>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bgColor)}>
            <Icon className={cn("w-4 h-4", config.color)} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-foreground">
          {value != null ? value : '—'}
        </span>
        <span className="text-sm text-muted-foreground">{config.unit}</span>
      </div>
      {baseline != null && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Baseline: {baseline}{config.unit}
          </span>
          {deviation != null && (
            <span className={cn(
              "text-xs font-medium",
              deviationNum > 5 ? "text-red-600" : "text-emerald-600"
            )}>
              {deviationNum > 0 ? `↑${deviation}%` : `${deviation}%`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}