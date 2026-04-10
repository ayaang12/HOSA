/*
  # PAN-IV Monitoring App - Initial Schema

  ## Summary
  Creates all tables required for the PAN-IV IV infection monitoring application,
  replacing the previous Base44 backend.

  ## New Tables

  ### `patients`
  - Core patient records including demographic info, catheter site, and monitoring state
  - Stores both baseline vitals and latest vitals for quick access
  - Tracks risk score and current status

  ### `alerts`
  - Infection risk alerts generated during monitoring sessions
  - Links to patients, stores vital values at time of alert
  - Supports acknowledgement workflow

  ### `vital_readings`
  - Time-series vital sign readings from the sensor
  - Each row is one sensor reading for one patient
  - Tracks whether reading was part of baseline calibration

  ## Security
  - RLS enabled on all tables
  - Public (anon) role can perform all CRUD since this app has no user-level auth
    (it's a clinical monitoring tool accessed internally)
  - Policies are scoped to anon role only; authenticated role gets the same access
*/

-- PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer,
  room text DEFAULT '',
  status text DEFAULT 'baseline_recording' CHECK (status IN ('normal', 'warning', 'high_risk', 'baseline_recording')),
  catheter_site text DEFAULT '',
  admission_date date,
  baseline_conductivity numeric,
  baseline_temperature numeric,
  baseline_pulse integer,
  baseline_spo2 integer,
  baseline_completed boolean DEFAULT false,
  latest_conductivity numeric,
  latest_temperature numeric,
  latest_pulse integer,
  latest_spo2 integer,
  risk_score numeric DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can select patients"
  ON patients FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon can insert patients"
  ON patients FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon can update patients"
  ON patients FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon can delete patients"
  ON patients FOR DELETE
  TO anon
  USING (true);

-- ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  patient_name text NOT NULL DEFAULT '',
  severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  reason text NOT NULL DEFAULT '',
  risk_score numeric,
  conductivity_value numeric,
  temperature_value numeric,
  pulse_value numeric,
  spo2_value numeric,
  acknowledged boolean DEFAULT false,
  timestamp timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can select alerts"
  ON alerts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon can insert alerts"
  ON alerts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon can update alerts"
  ON alerts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon can delete alerts"
  ON alerts FOR DELETE
  TO anon
  USING (true);

-- VITAL READINGS TABLE
CREATE TABLE IF NOT EXISTS vital_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  conductivity numeric,
  temperature numeric,
  pulse integer,
  spo2 integer,
  risk_score numeric,
  is_baseline boolean DEFAULT false,
  timestamp timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vital_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can select vital_readings"
  ON vital_readings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon can insert vital_readings"
  ON vital_readings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon can update vital_readings"
  ON vital_readings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon can delete vital_readings"
  ON vital_readings FOR DELETE
  TO anon
  USING (true);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_alerts_patient_id ON alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vital_readings_patient_id ON vital_readings(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_readings_created_at ON vital_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_updated_at ON patients(updated_at DESC);
