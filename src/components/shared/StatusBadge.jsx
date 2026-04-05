import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, AlertOctagon, Activity } from 'lucide-react';

const statusConfig = {
  normal: {
    label: 'Normal',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Shield,
  },
  warning: {
    label: 'Warning',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertTriangle,
  },
  high_risk: {
    label: 'High Risk',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertOctagon,
  },
  baseline_recording: {
    label: 'Calibrating',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Activity,
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || statusConfig.normal;
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-medium border rounded-full",
      config.className,
      size === 'sm' ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
    )}>
      <Icon className={size === 'sm' ? "w-3 h-3" : "w-4 h-4"} />
      {config.label}
    </span>
  );
}