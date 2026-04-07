import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import db from '@/api/base44Client';

export default function NewPatient() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    age: '',
    room: '',
    catheter_site: '',
    notes: '',
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Patient.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate(`/patients/${result.id}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      age: form.age ? parseInt(form.age) : undefined,
      status: 'baseline_recording',
      admission_date: new Date().toISOString().split('T')[0],
      baseline_completed: false,
    });
  };

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <Link to="/patients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </Link>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-xl">Register New Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  placeholder="45"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room">Room Number</Label>
                <Input
                  id="room"
                  value={form.room}
                  onChange={(e) => updateField('room', e.target.value)}
                  placeholder="301A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catheter_site">Catheter Site</Label>
                <Input
                  id="catheter_site"
                  value={form.catheter_site}
                  onChange={(e) => updateField('catheter_site', e.target.value)}
                  placeholder="Right antecubital"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Additional notes about the patient..."
                className="h-24"
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending || !form.name} className="w-full">
              <Save className="w-4 h-4 mr-1.5" />
              {createMutation.isPending ? 'Creating...' : 'Register Patient'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}