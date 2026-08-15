import { angleDeg, rotateVectorByQuat, solveGravity } from '../world-lab/gravity.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const trueUp = [0.07112, 0.99620, -0.05081];
const refs = [
  { bottom: [0, 0, 0], top: [0.0705, 0.9964, -0.0501] },
  { bottom: [2, -1, 4], top: [2.0718, -0.0039, 3.9487] },
  { bottom: [-3, 2, -2], top: [-2.9282, 2.9960, -2.0515] },
  { bottom: [5, 1, 1], top: [5.0700, 1.9965, 0.9501] }
];

const result = solveGravity(refs);
assert(result.status === 'CANDIDATE', 'gravity solver did not produce a candidate');
assert(result.referenceCount === 4, 'unexpected reference count');
assert(angleDeg(result.up, trueUp) < 0.25, 'gravity solver deviated from synthetic truth');
assert(result.residualStats.maxDeg < 0.25, 'synthetic residual unexpectedly high');

const corrected = rotateVectorByQuat(result.up, result.correctionQuaternion);
assert(angleDeg(corrected, [0, 1, 0]) < 1e-5, 'correction quaternion does not map solved up to +Y');

const withReversed = solveGravity([...refs, { bottom: [0, 2, 0], top: [-0.07, 1.004, 0.05] }]);
assert(withReversed.residualStats.maxDeg > 150, 'reversed vertical reference was silently absorbed');

const insufficient = solveGravity([{ bottom: [0, 0, 0], top: [0, 1, 0] }]);
assert(insufficient.status === 'INSUFFICIENT', 'single reference must not become a gravity candidate');

console.log('W0.2 gravity solver check: PASS');
