import { cn } from '@/lib/utils';

const severityConfig = {
  low: { label: 'Low', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'High', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  critical: { label: 'Critical', className: 'bg-red-50 text-red-700 border-red-200' },
};

export default function AlertSeverityBadge({ severity }) {
  const config = severityConfig[severity] || severityConfig.low;
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 text-xs font-semibold border rounded-full",
      config.className
    )}>
      {config.label}
    </span>
  );
}