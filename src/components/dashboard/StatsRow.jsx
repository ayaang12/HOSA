import { Card } from '@/components/ui/card';
import { Users, AlertTriangle, Activity, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { key: 'total', label: 'Total Patients', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
  { key: 'normal', label: 'Normal', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'high_risk', label: 'High Risk', icon: Activity, color: 'text-red-600', bg: 'bg-red-50' },
];

export default function StatsRow({ patients = [] }) {
  const counts = {
    total: patients.length,
    normal: patients.filter(p => p.status === 'normal').length,
    warning: patients.filter(p => p.status === 'warning').length,
    high_risk: patients.filter(p => p.status === 'high_risk').length,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.key} className="p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts[s.key]}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}