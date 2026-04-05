import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

const chartColors = {
  ph: '#2563eb',
  temperature: '#ea580c',
  pulse: '#e11d48',
  spo2: '#0891b2',
};

const chartLabels = {
  ph: 'pH Level',
  temperature: 'Temperature (°C)',
  pulse: 'Pulse (bpm)',
  spo2: 'SpO2 (%)',
};

export default function VitalsChart({ readings = [], type, baseline }) {
  const data = readings.map((r, i) => ({
    time: r.created_date ? format(new Date(r.created_date), 'HH:mm:ss') : `#${i + 1}`,
    value: r[type],
  }));

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {chartLabels[type]}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-40">
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
              {baseline != null && (
                <ReferenceLine
                  y={baseline}
                  stroke={chartColors[type]}
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColors[type]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}