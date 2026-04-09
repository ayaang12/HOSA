import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/shared/StatusBadge';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

export default function PatientTable({ patients = [] }) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No patients registered yet. Add a patient to begin monitoring.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Patient</TableHead>
            <TableHead className="font-semibold">Room</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Risk Score</TableHead>
            <TableHead className="font-semibold">Conductivity</TableHead>
            <TableHead className="font-semibold">Temp</TableHead>
            <TableHead className="font-semibold">Pulse</TableHead>
            <TableHead className="font-semibold">SpO2</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors">
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">Age: {patient.age || '-'}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm">{patient.room || '-'}</TableCell>
              <TableCell><StatusBadge status={patient.status} /></TableCell>
              <TableCell>
                <span className="text-sm font-mono font-semibold">
                  {patient.risk_score != null ? `${Math.round(patient.risk_score * 100)}%` : '-'}
                </span>
              </TableCell>
              <TableCell className="text-sm font-mono">{patient.latest_conductivity ?? '-'} mS/cm</TableCell>
              <TableCell className="text-sm font-mono">{patient.latest_temperature ?? '-'} C</TableCell>
              <TableCell className="text-sm font-mono">{patient.latest_pulse ?? '-'}</TableCell>
              <TableCell className="text-sm font-mono">{patient.latest_spo2 ?? '-'}%</TableCell>
              <TableCell>
                <Link 
                  to={`/patients/${patient.id}`}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
