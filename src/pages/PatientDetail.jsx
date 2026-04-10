import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Link, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import RiskGauge from '@/components/shared/RiskGauge';
import BaselinePanel from '@/components/patient/BaselinePanel';
import VitalsChart from '@/components/patient/VitalsChart';
import { ArrowLeft, Play, Square, Activity } from 'lucide-react';
import { getSensorData } from '@/lib/mockSensor';
import { analyzeRisk, getSeverityFromScore } from '@/lib/detection';
import { toast } from 'sonner';
import db from '@/api/base44Client';

export default function PatientDetail() {
  const { id: patientId } = useParams();
  const queryClient = useQueryClient();

  const [monitoring, setMonitoring] = useState(false);
  const [baselinePhase, setBaselinePhase] = useState(false);
  const [baselineReadings, setBaselineReadings] = useState([]);
  const [simMode, setSimMode] = useState('normal');
  const intervalRef = useRef(null);

  const { data: patient, isLoading: pLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => db.entities.Patient.get(patientId),
    enabled: !!patientId,
  });

  const { data: readings = [] } = useQuery({
    queryKey: ['readings', patientId],
    queryFn: () => db.entities.VitalReading.filter({ patient_id: patientId }, '-created_date', 50),
    enabled: !!patientId,
    refetchInterval: monitoring ? 3000 : false,
  });

  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Patient.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patient', patientId] }),
  });

  const createReadingMutation = useMutation({
    mutationFn: (data) => db.entities.VitalReading.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['readings', patientId] }),
  });

  const createAlertMutation = useMutation({
    mutationFn: (data) => db.entities.Alert.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setMonitoring(false);
    setBaselinePhase(false);
  }, []);

  const startMonitoring = useCallback(() => {
    if (!patient) return;
    setMonitoring(true);

    if (!patient.baseline_completed) {
      setBaselinePhase(true);
      setBaselineReadings([]);
      toast.info('Recording baseline... Please wait 60 seconds.');
    }
  }, [patient]);

  // Monitoring loop
  useEffect(() => {
    if (!monitoring || !patient) return;

    intervalRef.current = setInterval(() => {
      const sensorData = getSensorData(simMode);
      const timestamp = new Date().toISOString();

      if (baselinePhase) {
        setBaselineReadings(prev => {
          const updated = [...prev, sensorData];

          // After ~12 readings (60 seconds at 5s intervals), compute baseline
          if (updated.length >= 12) {
            const avgCond = parseFloat((updated.reduce((s, r) => s + r.conductivity, 0) / updated.length).toFixed(2));
            const avgTemp = parseFloat((updated.reduce((s, r) => s + r.temperature, 0) / updated.length).toFixed(1));
            const avgPulse = Math.round(updated.reduce((s, r) => s + r.pulse, 0) / updated.length);
            const avgSpo2 = Math.round(updated.reduce((s, r) => s + r.spo2, 0) / updated.length);

            updatePatientMutation.mutate({
              id: patient.id,
              data: {
                baseline_conductivity: avgCond,
                baseline_temperature: avgTemp,
                baseline_pulse: avgPulse,
                baseline_spo2: avgSpo2,
                baseline_completed: true,
                status: 'normal',
              },
            });

            // Save baseline readings
            updated.forEach(r => {
              createReadingMutation.mutate({
                patient_id: patient.id,
                ...r,
                is_baseline: true,
                timestamp,
              });
            });

            setBaselinePhase(false);
            toast.success('Baseline recorded successfully!');
          }

          return updated;
        });
      } else {
        // Active monitoring
        const baseline = {
          conductivity: patient.baseline_conductivity,
          temperature: patient.baseline_temperature,
          pulse: patient.baseline_pulse,
          spo2: patient.baseline_spo2,
        };

        const analysis = analyzeRisk(sensorData, baseline);

        // Save reading
        createReadingMutation.mutate({
          patient_id: patient.id,
          ...sensorData,
          risk_score: analysis.score,
          is_baseline: false,
          timestamp,
        });

        // Update patient
        const newStatus = analysis.severity === 'critical' ? 'high_risk' :
                          analysis.severity === 'high_risk' ? 'high_risk' :
                          analysis.severity === 'warning' ? 'warning' : 'normal';

        updatePatientMutation.mutate({
          id: patient.id,
          data: {
            latest_conductivity: sensorData.conductivity,
            latest_temperature: sensorData.temperature,
            latest_pulse: sensorData.pulse,
            latest_spo2: sensorData.spo2,
            risk_score: analysis.score,
            status: newStatus,
          },
        });

        // Create alert if risk is elevated
        if (analysis.score >= 0.3 && analysis.reasons.length > 0) {
          createAlertMutation.mutate({
            patient_id: patient.id,
            patient_name: patient.name,
            severity: getSeverityFromScore(analysis.score),
            reason: analysis.reasons.join(' + '),
            risk_score: analysis.score,
            conductivity_value: sensorData.conductivity,
            temperature_value: sensorData.temperature,
            pulse_value: sensorData.pulse,
            spo2_value: sensorData.spo2,
            acknowledged: false,
            timestamp,
          });

          if (analysis.score >= 0.5) {
            toast.error(`High risk detected for ${patient.name}: ${analysis.reasons[0]}`);
          }
        }
      }
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [monitoring, patient, baselinePhase, simMode]);

  // Cleanup on unmount
  useEffect(() => () => stopMonitoring(), [stopMonitoring]);

  const deviations = patient?.baseline_completed ? analyzeRisk(
    { conductivity: patient.latest_conductivity, temperature: patient.latest_temperature, pulse: patient.latest_pulse, spo2: patient.latest_spo2 },
    { conductivity: patient.baseline_conductivity, temperature: patient.baseline_temperature, pulse: patient.baseline_pulse, spo2: patient.baseline_spo2 }
  ).deviations : {};

  const sortedReadings = [...readings].reverse();

  if (pLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading patient data...</div>;
  }

  if (!patient) {
    return <div className="p-8 text-center text-muted-foreground">Patient not found.</div>;
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <Link to="/patients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
            <StatusBadge status={patient.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Room {patient.room || '-'} | Age {patient.age || '-'} | {patient.catheter_site || 'No catheter info'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RiskGauge score={patient.risk_score || 0} size="lg" />
        </div>
      </div>

      {/* Monitoring Controls */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {!monitoring ? (
              <Button onClick={startMonitoring} className="gap-1.5">
                <Play className="w-4 h-4" />
                {patient.baseline_completed ? 'Start Monitoring' : 'Start Baseline Recording'}
              </Button>
            ) : (
              <Button onClick={stopMonitoring} variant="destructive" className="gap-1.5">
                <Square className="w-4 h-4" />
                Stop Monitoring
              </Button>
            )}

            {monitoring && baselinePhase && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <Activity className="w-4 h-4 animate-pulse" />
                Recording baseline... ({baselineReadings.length}/12 samples)
              </div>
            )}

            {monitoring && !baselinePhase && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                <Activity className="w-4 h-4 animate-pulse" />
                Active monitoring
              </div>
            )}

            {/* Simulation Mode Selector */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sim Mode:</span>
              {['normal', 'mild', 'moderate', 'severe'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setSimMode(mode)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    simMode === mode
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <BaselinePanel patient={patient} deviations={deviations} />

      {/* Charts */}
      {sortedReadings.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <VitalsChart readings={sortedReadings} type="conductivity" baseline={patient.baseline_conductivity} />
          <VitalsChart readings={sortedReadings} type="temperature" baseline={patient.baseline_temperature} />
          <VitalsChart readings={sortedReadings} type="pulse" baseline={patient.baseline_pulse} />
          <VitalsChart readings={sortedReadings} type="spo2" baseline={patient.baseline_spo2} />
        </div>
      )}
    </div>
  );
}


