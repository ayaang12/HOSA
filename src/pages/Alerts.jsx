import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AlertSeverityBadge from '@/components/shared/AlertSeverityBadge';
import { Bell, Check, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import db from '@/api/base44Client';

export default function Alerts() {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => db.entities.Alert.list('-created_date', 100),
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Alert.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (id) => db.entities.Alert.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const filtered = alerts.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'unacknowledged') return !a.acknowledged;
    return a.severity === filter;
  });

  const unackCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unackCount > 0 ? `${unackCount} unacknowledged alert${unackCount > 1 ? 's' : ''}` : 'All alerts acknowledged'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Bell className="w-3 h-3" />
            {alerts.length} total
          </Badge>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unacknowledged">Unacknowledged</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="high">High</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No alerts to display</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <Card
              key={alert.id}
              className={`border transition-all ${
                !alert.acknowledged ? 'border-amber-200 bg-amber-50/30' : 'border-border'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Link
                        to={`/patients/${alert.patient_id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {alert.patient_name}
                      </Link>
                      <AlertSeverityBadge severity={alert.severity} />
                      {!alert.acknowledged && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px]">NEW</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.reason}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                      {alert.ph_value != null && <span>pH: {alert.ph_value}</span>}
                      {alert.temperature_value != null && <span>Temp: {alert.temperature_value}°C</span>}
                      {alert.pulse_value != null && <span>Pulse: {alert.pulse_value}</span>}
                      {alert.spo2_value != null && <span>SpO2: {alert.spo2_value}%</span>}
                      {alert.risk_score != null && <span>Score: {Math.round(alert.risk_score * 100)}%</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {alert.created_date ? format(new Date(alert.created_date), 'MMM d, HH:mm') : ''}
                    </span>
                    <div className="flex gap-1.5">
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => updateAlertMutation.mutate({ id: alert.id, data: { acknowledged: true } })}
                        >
                          <Check className="w-3 h-3" />
                          Ack
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => deleteAlertMutation.mutate(alert.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}