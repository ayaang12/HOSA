import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Droplets, Thermometer, HeartPulse, Wind } from 'lucide-react';
import VitalCard from '@/components/shared/VitalCard';

export default function BaselinePanel({ patient, deviations = {} }) {
  if (!patient?.baseline_completed) {
    return (
      <Card className="border border-blue-200 bg-blue-50/50">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <HeartPulse className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-blue-800">Baseline Not Yet Recorded</p>
          <p className="text-xs text-blue-600 mt-1">
            Start monitoring to record a 1-minute baseline calibration.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <VitalCard
        type="conductivity"
        value={patient.latest_conductivity}
        baseline={patient.baseline_conductivity}
        deviation={deviations.conductivity}
        icon={Droplets}
      />
      <VitalCard
        type="temperature"
        value={patient.latest_temperature}
        baseline={patient.baseline_temperature}
        deviation={deviations.temperature}
        icon={Thermometer}
      />
      <VitalCard
        type="pulse"
        value={patient.latest_pulse}
        baseline={patient.baseline_pulse}
        deviation={deviations.pulse}
        icon={HeartPulse}
      />
      <VitalCard
        type="spo2"
        value={patient.latest_spo2}
        baseline={patient.baseline_spo2}
        deviation={deviations.spo2}
        icon={Wind}
      />
    </div>
  );
}
