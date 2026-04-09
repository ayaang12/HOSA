import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Square, Activity, Droplets, Thermometer, HeartPulse, Wind } from 'lucide-react';
import { getSensorData } from '@/lib/mockSensor';
import { cn } from '@/lib/utils';

const MAX_POINTS = 60;

export default function LiveMonitor() {
  const [streaming, setStreaming] = useState(false);
  const [simMode, setSimMode] = useState('normal');
  const [data, setData] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const intervalRef = useRef(null);
  const counterRef = useRef(0);

  const startStream = () => {
    setStreaming(true);
    counterRef.current = 0;
    setData([]);
  };

  const stopStream = () => {
    setStreaming(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!streaming) return;

    intervalRef.current = setInterval(() => {
      const reading = getSensorData(simMode);
      counterRef.current += 1;
      const point = {
        time: counterRef.current,
        ...reading,
      };

      setLatestReading(reading);
      setData(prev => {
        const updated = [...prev, point];
        return updated.length > MAX_POINTS ? updated.slice(-MAX_POINTS) : updated;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [streaming, simMode]);

  useEffect(() => () => stopStream(), []);

  const vitals = [
    { key: 'conductivity', label: 'Conductivity', icon: Droplets, color: '#2563eb', value: latestReading?.conductivity, unit: 'mS/cm' },
    { key: 'temperature', label: 'Temp', icon: Thermometer, color: '#ea580c', value: latestReading?.temperature, unit: 'C' },
    { key: 'pulse', label: 'Pulse', icon: HeartPulse, color: '#e11d48', value: latestReading?.pulse, unit: 'bpm' },
    { key: 'spo2', label: 'SpO2', icon: Wind, color: '#0891b2', value: latestReading?.spo2, unit: '%' },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Live Monitor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time sensor data stream</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={simMode} onValueChange={setSimMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="mild">Mild</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="severe">Severe</SelectItem>
            </SelectContent>
          </Select>
          {!streaming ? (
            <Button onClick={startStream} className="gap-1.5">
              <Play className="w-4 h-4" />
              Start Stream
            </Button>
          ) : (
            <Button onClick={stopStream} variant="destructive" className="gap-1.5">
              <Square className="w-4 h-4" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium",
        streaming 
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-muted border-border text-muted-foreground"
      )}>
        <Activity className={cn("w-4 h-4", streaming && "animate-pulse")}
        />
        {streaming ? `Streaming live data - ${data.length} readings` : 'Sensor stream idle'}
      </div>

      {/* Live Vitals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {vitals.map((v) => (
          <Card key={v.key} className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <v.icon className="w-4 h-4" style={{ color: v.color }} />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{v.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  {v.value ?? '-'}
                </span>
                <span className="text-sm text-muted-foreground">{v.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {vitals.map((v) => (
          <Card key={v.key} className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <v.icon className="w-3.5 h-3.5" style={{ color: v.color }} />
                {v.label} {v.unit && `(${v.unit})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={v.key}
                      stroke={v.color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
