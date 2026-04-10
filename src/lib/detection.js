/**
 * ========================================
 * INFECTION RISK DETECTION MODULE
 * ========================================
 * 
 * This module contains the weighted scoring algorithm for detecting
 * catheter infection risk based on vital sign deviations from baseline.
 * 
 * TO REPLACE WITH AI/ML MODEL:
 * 1. Keep the analyzeRisk(data, baseline) function signature
 * 2. Replace the internal logic with your model inference
 * 3. Return the same { score, severity, reasons } object
 * 
 * WEIGHTS can be adjusted below to tune sensitivity.
 */

// === CONFIGURABLE WEIGHTS ===
const WEIGHTS = {
  conductivity: 0.25,
  temperature: 0.20,
  pulse: 0.30,
  spo2: 0.35,
};

// === THRESHOLDS ===
// Updated rules requested by clinical workflow:
// - SpO2 change >= 4% is worrisome (immediate)
// - Pulse absolute delta >= 15 bpm is worrisome (immediate)
// - Temperature change 3-5% is worrisome only when it rises within <=10 min
// - Conductivity change around 25% is worrisome only when it rises within <=10 min
const DEVIATION_THRESHOLDS = {
  conductivity: 0.25,
  temperature: 0.03,
  temperatureHigh: 0.05,
  pulseAbsolute: 15,
  spo2: 0.04,
  rapidWindowMinutes: 10,
};

// Risk score thresholds for severity classification
const SEVERITY_THRESHOLDS = {
  low: 0.25,
  medium: 0.55,
  high: 0.8,
};

/**
 * Calculate percentage deviation from baseline
 */
function calculateDeviation(current, baseline) {
  if (!baseline || baseline === 0) return 0;
  return Math.abs((current - baseline) / baseline);
}

function getIsoTime(reading) {
  return reading?.timestamp || reading?.created_at || null;
}

function getAnchorReadingWithinWindow(history = [], currentTimestamp, windowMinutes) {
  if (!Array.isArray(history) || history.length === 0) return null;
  const currentMs = new Date(currentTimestamp).getTime();
  if (Number.isNaN(currentMs)) return null;

  const windowStartMs = currentMs - (windowMinutes * 60 * 1000);

  return history
    .filter((item) => {
      const time = getIsoTime(item);
      if (!time) return false;
      const ms = new Date(time).getTime();
      return !Number.isNaN(ms) && ms >= windowStartMs && ms < currentMs;
    })
    .sort((a, b) => new Date(getIsoTime(a)).getTime() - new Date(getIsoTime(b)).getTime())[0] || null;
}

/**
 * ========================================
 * MAIN ANALYSIS FUNCTION
 * ========================================
 * 
 * @param {Object} data - Current sensor readings { conductivity, temperature, pulse, spo2 }
 * @param {Object} baseline - Baseline readings { conductivity, temperature, pulse, spo2 }
 * @returns {Object} { score, severity, reasons, deviations }
 * 
 * TO REPLACE WITH AI MODEL:
 * Keep this function signature, replace the body with:
 *   const prediction = await myModel.predict(data, baseline);
 *   return { score: prediction.risk, severity: ..., reasons: [...] };
 */
export function analyzeRisk(data, baseline, context = {}) {
  if (!data || !baseline) {
    return { score: 0, severity: 'normal', reasons: [], deviations: {} };
  }

  const { history = [], currentTimestamp = new Date().toISOString() } = context;
  const anchor = getAnchorReadingWithinWindow(history, currentTimestamp, DEVIATION_THRESHOLDS.rapidWindowMinutes);

  const pulseDeltaAbsolute = Math.abs((data.pulse ?? 0) - (baseline.pulse ?? 0));
  const spo2Deviation = calculateDeviation(data.spo2, baseline.spo2);
  const tempDeviation = calculateDeviation(data.temperature, baseline.temperature);
  const conductivityDeviation = calculateDeviation(data.conductivity, baseline.conductivity);

  const rapidTempDeviation = anchor
    ? calculateDeviation(data.temperature, anchor.temperature)
    : 0;
  const rapidConductivityDeviation = anchor
    ? calculateDeviation(data.conductivity, anchor.conductivity)
    : 0;

  const spo2Concern = spo2Deviation >= DEVIATION_THRESHOLDS.spo2;
  const pulseConcern = pulseDeltaAbsolute >= DEVIATION_THRESHOLDS.pulseAbsolute;
  const rapidTempConcern = tempDeviation >= DEVIATION_THRESHOLDS.temperature
    && rapidTempDeviation >= DEVIATION_THRESHOLDS.temperature;
  const rapidConductivityConcern = conductivityDeviation >= DEVIATION_THRESHOLDS.conductivity
    && rapidConductivityDeviation >= DEVIATION_THRESHOLDS.conductivity;

  const deviations = {
    conductivity: conductivityDeviation,
    temperature: tempDeviation,
    pulse: calculateDeviation(data.pulse, baseline.pulse),
    spo2: spo2Deviation,
  };

  let score = 0;
  if (spo2Concern) {
    score += WEIGHTS.spo2 + Math.min((spo2Deviation - DEVIATION_THRESHOLDS.spo2) * 3, 0.15);
  }
  if (pulseConcern) {
    score += WEIGHTS.pulse + Math.min((pulseDeltaAbsolute - DEVIATION_THRESHOLDS.pulseAbsolute) / 100, 0.15);
  }
  if (rapidTempConcern) {
    const tempThreshold = tempDeviation >= DEVIATION_THRESHOLDS.temperatureHigh
      ? DEVIATION_THRESHOLDS.temperatureHigh
      : DEVIATION_THRESHOLDS.temperature;
    score += WEIGHTS.temperature + Math.min((tempDeviation - tempThreshold) * 4, 0.15);
  }
  if (rapidConductivityConcern) {
    score += WEIGHTS.conductivity + Math.min((conductivityDeviation - DEVIATION_THRESHOLDS.conductivity), 0.2);
  }

  // If temp + conductivity spike together quickly, keep it as a slight/early warning.
  if (rapidTempConcern && rapidConductivityConcern) {
    score = Math.min(score, 0.45);
  }

  // Determine severity
  let severity = 'normal';
  if (score >= SEVERITY_THRESHOLDS.high) severity = 'critical';
  else if (score >= SEVERITY_THRESHOLDS.medium) severity = 'high_risk';
  else if (score >= SEVERITY_THRESHOLDS.low) severity = 'warning';

  // Build reasons list
  const reasons = [];
  if (rapidTempConcern && rapidConductivityConcern) {
    reasons.push('Slight infection chance: temperature + conductivity changed quickly together');
  }
  if (rapidConductivityConcern) {
    reasons.push(`Conductivity rose ${(deviations.conductivity * 100).toFixed(1)}% within ${DEVIATION_THRESHOLDS.rapidWindowMinutes} min`);
  }
  if (rapidTempConcern) {
    reasons.push(`Temperature rose ${(deviations.temperature * 100).toFixed(1)}% within ${DEVIATION_THRESHOLDS.rapidWindowMinutes} min`);
  }
  if (pulseConcern) {
    reasons.push(`Pulse changed by ${pulseDeltaAbsolute.toFixed(0)} bpm`);
  }
  if (spo2Concern) {
    reasons.push(`SpO2 deviation ${(deviations.spo2 * 100).toFixed(1)}%`);
  }

  return {
    score: Math.min(score, 1.0), // Normalize to 0-1
    severity,
    reasons,
    deviations: {
      conductivity: (deviations.conductivity * 100).toFixed(1),
      temperature: (deviations.temperature * 100).toFixed(1),
      pulse: (deviations.pulse * 100).toFixed(1),
      spo2: (deviations.spo2 * 100).toFixed(1),
      pulse_bpm_delta: pulseDeltaAbsolute.toFixed(0),
    },
  };
}

/**
 * Determine alert severity from risk score
 */
export function getSeverityFromScore(score) {
  if (score >= SEVERITY_THRESHOLDS.high) return 'critical';
  if (score >= SEVERITY_THRESHOLDS.medium) return 'high';
  if (score >= SEVERITY_THRESHOLDS.low) return 'medium';
  return 'low';
}

export { WEIGHTS, DEVIATION_THRESHOLDS, SEVERITY_THRESHOLDS };
