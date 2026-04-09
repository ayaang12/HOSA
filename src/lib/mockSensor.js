/**
 * ========================================
 * MOCK SENSOR DATA GENERATOR
 * ========================================
 * 
 * Simulates Arduino serial port data for testing.
 * 
 * TO REPLACE WITH REAL HARDWARE:
 * Replace getSensorData() with your serial port reader:
 *   import SerialPort from 'serialport';
 *   const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });
 *   export async function getSensorData() {
 *     return new Promise((resolve) => {
 *       port.once('data', (data) => resolve(JSON.parse(data.toString())));
 *     });
 *   }
 * 
 * DATA FORMAT:
 * {
 *   "conductivity": 15.2,  // Range: 12 - 18 mS/cm
 *   "temperature": 37.0,   // Range: 35.0 - 42.0 (C)
 *   "pulse": 75,           // Range: 40 - 180 (bpm)
 *   "spo2": 98             // Range: 85 - 100 (%)
 * }
 */

// Normal baseline ranges
const NORMAL_RANGES = {
  conductivity: { min: 12.0, max: 18.0, mean: 15.0 },
  temperature: { min: 36.1, max: 37.2, mean: 36.6 },
  pulse: { min: 60, max: 100, mean: 75 },
  spo2: { min: 95, max: 100, mean: 98 },
};

function gaussianRandom(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

/**
 * Generate normal (healthy) vital signs
 */
export function generateNormalReading() {
  return {
    conductivity: parseFloat(gaussianRandom(NORMAL_RANGES.conductivity.mean, 0.35).toFixed(2)),
    temperature: parseFloat(gaussianRandom(NORMAL_RANGES.temperature.mean, 0.2).toFixed(1)),
    pulse: Math.round(gaussianRandom(NORMAL_RANGES.pulse.mean, 5)),
    spo2: Math.min(100, Math.round(gaussianRandom(NORMAL_RANGES.spo2.mean, 1))),
  };
}

/**
 * Generate abnormal (infection-risk) vital signs
 * Simulates gradual deterioration from baseline
 */
export function generateAbnormalReading(severity = 'mild') {
  const factors = {
    mild: { conductivityShift: 1.5, tempShift: 0.8, pulseShift: 15, spo2Shift: -2 },
    moderate: { conductivityShift: 3.0, tempShift: 1.5, pulseShift: 30, spo2Shift: -5 },
    severe: { conductivityShift: 5.0, tempShift: 2.5, pulseShift: 50, spo2Shift: -10 },
  };

  const f = factors[severity] || factors.mild;
  const direction = 1; // Conductivity typically rises with exudate/ion load

  return {
    conductivity: parseFloat((NORMAL_RANGES.conductivity.mean + direction * f.conductivityShift + gaussianRandom(0, 0.25)).toFixed(2)),
    temperature: parseFloat((NORMAL_RANGES.temperature.mean + f.tempShift + gaussianRandom(0, 0.1)).toFixed(1)),
    pulse: Math.round(NORMAL_RANGES.pulse.mean + f.pulseShift + gaussianRandom(0, 3)),
    spo2: Math.max(70, Math.min(100, Math.round(NORMAL_RANGES.spo2.mean + f.spo2Shift + gaussianRandom(0, 1)))),
  };
}

/**
 * ========================================
 * MAIN SENSOR DATA INTERFACE
 * ========================================
 * 
 * This is the function to replace when connecting real hardware.
 * 
 * @param {string} mode - 'normal', 'mild', 'moderate', 'severe'
 * @returns {Object} Sensor reading { conductivity, temperature, pulse, spo2 }
 */
export function getSensorData(mode = 'normal') {
  if (mode === 'normal') {
    return generateNormalReading();
  }
  return generateAbnormalReading(mode);
}

export { NORMAL_RANGES };
