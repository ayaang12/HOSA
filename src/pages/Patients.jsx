import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/shared/StatusBadge';
import RiskGauge from '@/components/shared/RiskGauge';
import { Plus, Search, User } from 'lucide-react';
import db from '@/api/base44Client';

export default function Patients() {
  const [search, setSearch] = useState('');

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => db.entities.Patient.list('-updated_date'),
  });

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.room?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor all patients</p>
        </div>
        <Link to="/patients/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Patient
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {patients.length === 0 ? 'No patients yet. Add your first patient.' : 'No matching patients found.'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((patient) => (
            <Link key={patient.id} to={`/patients/${patient.id}`}>
              <Card className="border border-border hover:shadow-md transition-all duration-200 cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {patient.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Room {patient.room || '-'} | Age {patient.age || '-'}
                        </p>
                      </div>
                    </div>
                    <RiskGauge score={patient.risk_score || 0} />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <StatusBadge status={patient.status} />
                    <span className="text-xs text-muted-foreground">
                      {patient.catheter_site || 'No catheter info'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
