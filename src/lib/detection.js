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
// These control how much each vital sign contributes to the risk score.
// All weights should sum to 1.0
const WEIGHTS = {
  ph: 0.35,          // pH near catheter — highest weight (most indicative of infection)
  temperature: 0.25, // Body temperature — fever is a key infection sign
  pulse: 0.20,       // Heart rate — elevated with infection
  spo2: 0.20,        // Oxygen saturation — drops with systemic infection
};

// === THRESHOLDS ===
// Percentage deviation from baseline that triggers concern
const DEVIATION_THRESHOLDS = {
  ph: 0.05,          // 5% deviation is significant for pH
  temperature: 0.02, // 2% (~0.7°C from 37°C)
  pulse: 0.15,       // 15% increase
  spo2: 0.03,        // 3% drop is concerning
};

// Risk score thresholds for severity classification
const SEVERITY_THRESHOLDS = {
  low: 0.3,      // Below this = normal
  medium: 0.5,   // Below this = warning
  high: 0.7,     // Below this = high risk
  // Above high = critical
};

/**
 * Calculate percentage deviation from baseline
 */
function calculateDeviation(current, baseline) {
  if (!baseline || baseline === 0) return 0;
  return Math.abs((current - baseline) / baseline);
}

/**
 * Normalize a deviation based on its threshold
 * Returns 0-1 where 1 means the deviation is at or beyond the threshold
 */
function normalizeDeviation(deviation, threshold) {
  return Math.min(deviation / threshold, 2.0); // Cap at 2x threshold
}

/**
 * ========================================
 * MAIN ANALYSIS FUNCTION
 * ========================================
 * 
 * @param {Object} data - Current sensor readings { ph, temperature, pulse, spo2 }
 * @param {Object} baseline - Baseline readings { ph, temperature, pulse, spo2 }
 * @returns {Object} { score, severity, reasons, deviations }
 * 
 * TO REPLACE WITH AI MODEL:
 * Keep this function signature, replace the body with:
 *   const prediction = await myModel.predict(data, baseline);
 *   return { score: prediction.risk, severity: ..., reasons: [...] };
 */
export function analyzeRisk(data, baseline) {
  if (!data || !baseline) {
    return { score: 0, severity: 'normal', reasons: [], deviations: {} };
  }

  const deviations = {
    ph: calculateDeviation(data.ph, baseline.ph),
    temperature: calculateDeviation(data.temperature, baseline.temperature),
    pulse: calculateDeviation(data.pulse, baseline.pulse),
    spo2: calculateDeviation(data.spo2, baseline.spo2),
  };

  const normalizedDeviations = {
    ph: normalizeDeviation(deviations.ph, DEVIATION_THRESHOLDS.ph),
    temperature: normalizeDeviation(deviations.temperature, DEVIATION_THRESHOLDS.temperature),
    pulse: normalizeDeviation(deviations.pulse, DEVIATION_THRESHOLDS.pulse),
    spo2: normalizeDeviation(deviations.spo2, DEVIATION_THRESHOLDS.spo2),
  };

  // Weighted score calculation
  const score =
    normalizedDeviations.ph * WEIGHTS.ph +
    normalizedDeviations.temperature * WEIGHTS.temperature +
    normalizedDeviations.pulse * WEIGHTS.pulse +
    normalizedDeviations.spo2 * WEIGHTS.spo2;

  // Determine severity
  let severity = 'normal';
  if (score >= SEVERITY_THRESHOLDS.high) severity = 'critical';
  else if (score >= SEVERITY_THRESHOLDS.medium) severity = 'high_risk';
  else if (score >= SEVERITY_THRESHOLDS.low) severity = 'warning';

  // Build reasons list
  const reasons = [];
  if (normalizedDeviations.ph > 0.5) {
    reasons.push(`pH deviation ${(deviations.ph * 100).toFixed(1)}% from baseline`);
  }
  if (normalizedDeviations.temperature > 0.5) {
    reasons.push(`Temperature deviation ${(deviations.temperature * 100).toFixed(1)}%`);
  }
  if (normalizedDeviations.pulse > 0.5) {
    reasons.push(`Pulse deviation ${(deviations.pulse * 100).toFixed(1)}%`);
  }
  if (normalizedDeviations.spo2 > 0.5) {
    reasons.push(`SpO2 deviation ${(deviations.spo2 * 100).toFixed(1)}%`);
  }

  return {
    score: Math.min(score, 1.0), // Normalize to 0-1
    severity,
    reasons,
    deviations: {
      ph: (deviations.ph * 100).toFixed(1),
      temperature: (deviations.temperature * 100).toFixed(1),
      pulse: (deviations.pulse * 100).toFixed(1),
      spo2: (deviations.spo2 * 100).toFixed(1),
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