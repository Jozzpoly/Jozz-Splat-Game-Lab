const EPS = 1e-9;
const RAD2DEG = 180 / Math.PI;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (v, s) => [v[0] * s, v[1] * s, v[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
const length = (v) => Math.hypot(v[0], v[1], v[2]);
const normalize = (v) => {
  const len = length(v);
  return len > EPS ? scale(v, 1 / len) : null;
};

export function angleDeg(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return Number.NaN;
  return Math.acos(clamp(dot(na, nb), -1, 1)) * RAD2DEG;
}

export function axisAngleDeg(a, b) {
  const directed = angleDeg(a, b);
  return Number.isFinite(directed) ? Math.min(directed, 180 - directed) : Number.NaN;
}

export function rotationBetween(from, to) {
  const a = normalize(from);
  const b = normalize(to);
  if (!a || !b) return [0, 0, 0, 1];
  const d = clamp(dot(a, b), -1, 1);

  if (d < -0.999999) {
    let axis = normalize(cross(a, [1, 0, 0]));
    if (!axis) axis = normalize(cross(a, [0, 1, 0]));
    if (!axis) axis = [0, 0, 1];
    return [axis[0], axis[1], axis[2], 0];
  }

  const c = cross(a, b);
  const s = Math.sqrt((1 + d) * 2);
  const inv = 1 / Math.max(EPS, s);
  const q = [c[0] * inv, c[1] * inv, c[2] * inv, s * 0.5];
  const qLen = Math.hypot(...q) || 1;
  return q.map((v) => v / qLen);
}

export function rotateVectorByQuat(v, q) {
  const [qx, qy, qz, qw] = q;
  const qv = [qx, qy, qz];
  const t = scale(cross(qv, v), 2);
  return add(add(v, scale(t, qw)), cross(qv, t));
}

function covarianceMatrix(directions) {
  const matrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  for (const v of directions) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) matrix[r][c] += v[r] * v[c];
    }
  }
  return matrix;
}

function multiply(matrix, v) {
  return [
    matrix[0][0] * v[0] + matrix[0][1] * v[1] + matrix[0][2] * v[2],
    matrix[1][0] * v[0] + matrix[1][1] * v[1] + matrix[1][2] * v[2],
    matrix[2][0] * v[0] + matrix[2][1] * v[1] + matrix[2][2] * v[2]
  ];
}

function dominantAxis(directions) {
  const matrix = covarianceMatrix(directions);
  const basis = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  let axis = basis
    .map((v) => ({ v, energy: dot(v, multiply(matrix, v)) }))
    .sort((a, b) => b.energy - a.energy)[0].v;

  for (let i = 0; i < 48; i++) {
    const normalized = normalize(multiply(matrix, axis));
    if (!normalized) break;
    axis = normalized;
  }

  const rayleigh = dot(axis, multiply(matrix, axis));
  const trace = matrix[0][0] + matrix[1][1] + matrix[2][2];
  return {
    axis,
    coherence: trace > EPS ? rayleigh / trace : 0
  };
}

function orientAxis(axis, directions) {
  let agree = 0;
  let reverse = 0;
  for (const direction of directions) {
    if (dot(direction, axis) >= 0) agree++;
    else reverse++;
  }

  let oriented = axis;
  if (reverse > agree) {
    oriented = scale(axis, -1);
    [agree, reverse] = [reverse, agree];
  } else if (reverse === agree && dot(axis, [0, 1, 0]) < 0) {
    oriented = scale(axis, -1);
  }

  return {
    up: oriented,
    agreeCount: agree,
    reversedCount: reverse,
    agreeFraction: directions.length ? agree / directions.length : 0,
    voteMargin: agree - reverse,
    method: agree === reverse ? 'BASELINE_Y_TIE_BREAK' : 'MAJORITY_BOTTOM_TO_TOP'
  };
}

function stats(values) {
  if (!values.length) return { meanDeg: Number.NaN, rmsDeg: Number.NaN, medianDeg: Number.NaN, maxDeg: Number.NaN };
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const rms = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0) / values.length);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) * 0.5;
  return { meanDeg: mean, rmsDeg: rms, medianDeg: median, maxDeg: sorted.at(-1) };
}

export function solveGravity(references) {
  const valid = [];
  for (const ref of references) {
    const directionRaw = sub(ref.top, ref.bottom);
    const referenceLength = length(directionRaw);
    const direction = normalize(directionRaw);
    if (!direction || referenceLength <= EPS) continue;
    valid.push({ ...ref, direction, referenceLength });
  }

  if (valid.length < 2) {
    return {
      status: 'INSUFFICIENT',
      referenceCount: valid.length,
      required: 2
    };
  }

  const axisResult = dominantAxis(valid.map((ref) => ref.direction));
  const orientation = orientAxis(axisResult.axis, valid.map((ref) => ref.direction));
  const up = orientation.up;

  const residuals = valid.map((ref, index) => {
    const directedResidualDeg = angleDeg(ref.direction, up);
    return {
      index,
      axisResidualDeg: Math.min(directedResidualDeg, 180 - directedResidualDeg),
      directedResidualDeg,
      directionStatus: directedResidualDeg <= 90 ? 'AGREES' : 'REVERSED',
      referenceLength: ref.referenceLength
    };
  });

  const axisResidualStats = stats(residuals.map((r) => r.axisResidualDeg));
  const directedResidualStats = stats(residuals.map((r) => r.directedResidualDeg));
  const tiltDeg = angleDeg(up, [0, 1, 0]);
  const correctionQuaternion = rotationBetween(up, [0, 1, 0]);

  return {
    status: 'CANDIDATE',
    referenceCount: valid.length,
    up,
    tiltDeg,
    axisCoherence: axisResult.coherence,
    residuals,
    axisResidualStats,
    directedResidualStats,
    directionConsensus: {
      agreeCount: orientation.agreeCount,
      reversedCount: orientation.reversedCount,
      agreeFraction: orientation.agreeFraction,
      voteMargin: orientation.voteMargin,
      method: orientation.method
    },
    correctionQuaternion,
    automaticAcceptance: false
  };
}
