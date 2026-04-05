const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from '@tanstack/react-query';

import StatsRow from '@/components/dashboard/StatsRow';
import PatientTable from '@/components/dashboard/PatientTable';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: patients = [], isLoading: pLoading, refetch: refetchPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => db.entities.Patient.list('-updated_date'),
  });

  const { data: alerts = [], isLoading: aLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => db.entities.Alert.list('-created_date', 10),
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">IV infection monitoring overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchPatients()}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Link to="/patients/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      {pLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <StatsRow patients={patients} />
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Patient Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading patients...</div>
              ) : (
                <PatientTable patients={patients} />
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          {aLoading ? (
            <div className="h-64 rounded-xl bg-muted animate-pulse" />
          ) : (
            <RecentAlerts alerts={alerts} />
          )}
        </div>
      </div>
    </div>
  );
}