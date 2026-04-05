import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AlertSeverityBadge from '@/components/shared/AlertSeverityBadge';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function RecentAlerts({ alerts = [] }) {
  const recent = alerts.slice(0, 5);

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Recent Alerts
        </CardTitle>
        <Link to="/alerts" className="text-xs text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No alerts yet</p>
        ) : (
          <div className="space-y-3">
            {recent.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {alert.patient_name}
                    </span>
                    <AlertSeverityBadge severity={alert.severity} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{alert.reason}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {alert.created_date ? format(new Date(alert.created_date), 'HH:mm') : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}