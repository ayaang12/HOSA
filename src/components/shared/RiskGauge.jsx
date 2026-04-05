import { cn } from '@/lib/utils';

export default function RiskGauge({ score = 0, size = 'md' }) {
  const percentage = Math.round(score * 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score * circumference);

  let color = 'text-emerald-500';
  let bgRing = 'text-emerald-100';
  let label = 'Low Risk';
  
  if (score >= 0.7) {
    color = 'text-red-500';
    bgRing = 'text-red-100';
    label = 'Critical';
  } else if (score >= 0.5) {
    color = 'text-orange-500';
    bgRing = 'text-orange-100';
    label = 'High Risk';
  } else if (score >= 0.3) {
    color = 'text-amber-500';
    bgRing = 'text-amber-100';
    label = 'Warning';
  }

  const dim = size === 'lg' ? 'w-32 h-32' : 'w-20 h-20';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative", dim)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            className={bgRing}
            cx="50" cy="50" r="45"
            fill="none" stroke="currentColor" strokeWidth="8"
          />
          <circle
            className={cn(color, "transition-all duration-1000 ease-out")}
            cx="50" cy="50" r="45"
            fill="none" stroke="currentColor" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", size === 'lg' ? "text-xl" : "text-sm")}>
            {percentage}%
          </span>
        </div>
      </div>
      <span className={cn("text-xs font-semibold", color)}>{label}</span>
    </div>
  );
}