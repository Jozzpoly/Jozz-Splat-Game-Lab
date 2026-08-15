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

function dominantAxis(directions) {
  const matrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  let signedSum = [0, 0, 0];

  for (const v of directions) {
    signedSum = add(signedSum, v);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) matrix[r][c] += v[r] * v[c];
    }
  }

  let axis = normalize(signedSum) ?? [0, 1, 0];
  for (let i = 0; i < 32; i++) {
    const next = [
      matrix[0][0] * axis[0] + matrix[0][1] * axis[1] + matrix[0][2] * axis[2],
      matrix[1][0] * axis[0] + matrix[1][1] * axis[1] + matrix[1][2] * axis[2],
      matrix[2][0] * axis[0] + matrix[2][1] * axis[1] + matrix[2][2] * axis[2]
    ];
    const normalized = normalize(next);
    if (!normalized) break;
    axis = normalized;
  }

  if (dot(axis, signedSum) < 0) axis = scale(axis, -1);
  return axis;
}

function percentile(sorted, p) {
  if (!sorted.length) return Number.NaN;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
  return sorted[idx];
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

  const up = dominantAxis(valid.map((ref) => ref.direction));
  const residuals = valid.map((ref, index) => ({
    index,
    angleDeg: angleDeg(ref.direction, up),
    referenceLength: ref.referenceLength
  }));
  const values = residuals.map((r) => r.angleDeg).sort((a, b) => a - b);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const rms = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0) / values.length);
  const max = values.at(-1);
  const median = percentile(values, 0.5);
  const tiltDeg = angleDeg(up, [0, 1, 0]);
  const correctionQuaternion = rotationBetween(up, [0, 1, 0]);

  return {
    status: 'CANDIDATE',
    referenceCount: valid.length,
    up,
    tiltDeg,
    residuals,
    residualStats: {
      meanDeg: mean,
      rmsDeg: rms,
      medianDeg: median,
      maxDeg: max
    },
    correctionQuaternion,
    automaticAcceptance: false
  };
}
