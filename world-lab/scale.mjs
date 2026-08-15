const EPS = 1e-12;

const mean = (values) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : Number.NaN;

function median(values) {
  if (!values.length) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) * 0.5;
}

function rms(values) {
  return values.length ? Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length) : Number.NaN;
}

export function parseKnownMetres(value) {
  if (value === null || value === undefined) return null;
  const normalized = typeof value === 'string' ? value.trim().replace(',', '.') : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > EPS ? parsed : null;
}

export function buildScaleSolverInput(measurements) {
  return measurements
    .map((item, sourceIndex) => ({ item, sourceIndex }))
    .filter(({ item }) => Number(item.sourceLength) > EPS && parseKnownMetres(item.knownMetres) !== null)
    .map(({ item, sourceIndex }) => ({
      sourceIndex,
      sourceLength: Number(item.sourceLength),
      knownMetres: parseKnownMetres(item.knownMetres)
    }));
}

export function solveScale(measurements) {
  const valid = [];
  for (const measurement of measurements) {
    const sourceLength = Number(measurement.sourceLength);
    const knownMetres = Number(measurement.knownMetres);
    if (!(sourceLength > EPS) || !(knownMetres > EPS)) continue;
    valid.push({ ...measurement, sourceLength, knownMetres });
  }

  if (valid.length < 2) {
    return { status: 'INSUFFICIENT', measurementCount: valid.length, required: 2, automaticAcceptance: false };
  }

  // Origin-constrained least squares: sourceLength ~= unitsPerMetre * knownMetres.
  // This retains every valid measurement and does not trim outliers.
  const denominator = valid.reduce((sum, item) => sum + item.knownMetres * item.knownMetres, 0);
  const numerator = valid.reduce((sum, item) => sum + item.knownMetres * item.sourceLength, 0);
  const unitsPerMetre = numerator / Math.max(EPS, denominator);
  const metresPerSourceUnit = 1 / unitsPerMetre;

  const residuals = valid.map((item, index) => {
    const impliedUnitsPerMetre = item.sourceLength / item.knownMetres;
    const predictedSourceLength = unitsPerMetre * item.knownMetres;
    const sourceResidual = item.sourceLength - predictedSourceLength;
    const predictedMetres = item.sourceLength * metresPerSourceUnit;
    const metreResidual = predictedMetres - item.knownMetres;
    const relativeResidual = metreResidual / item.knownMetres;
    return {
      index,
      impliedUnitsPerMetre,
      predictedSourceLength,
      sourceResidual,
      predictedMetres,
      metreResidual,
      relativeResidual,
      relativeResidualPct: relativeResidual * 100
    };
  });

  const ratios = residuals.map((item) => item.impliedUnitsPerMetre);
  const relativeAbs = residuals.map((item) => Math.abs(item.relativeResidualPct));
  const ratioMean = mean(ratios);
  const ratioMedian = median(ratios);
  const ratioStdDev = Math.sqrt(mean(ratios.map((value) => (value - ratioMean) ** 2)));

  return {
    status: 'CANDIDATE',
    measurementCount: valid.length,
    unitsPerMetre,
    metresPerSourceUnit,
    residuals,
    consistency: {
      ratioMean,
      ratioMedian,
      ratioStdDev,
      ratioCoefficientOfVariationPct: ratioMean > EPS ? ratioStdDev / ratioMean * 100 : Number.NaN,
      rmsRelativeResidualPct: rms(residuals.map((item) => item.relativeResidualPct)),
      medianAbsRelativeResidualPct: median(relativeAbs),
      maxAbsRelativeResidualPct: relativeAbs.length ? Math.max(...relativeAbs) : Number.NaN
    },
    method: 'ORIGIN_CONSTRAINED_LEAST_SQUARES_ALL_VALID_MEASUREMENTS',
    silentOutlierRemoval: false,
    automaticAcceptance: false
  };
}
