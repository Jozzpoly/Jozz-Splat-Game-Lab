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
assert(result.axisResidualStats.maxDeg < 0.25, 'synthetic axis residual unexpectedly high');
assert(result.directionConsensus.reversedCount === 0, 'clean synthetic references unexpectedly reversed');
assert(result.axisCoherence > 0.9999, 'clean synthetic axis coherence unexpectedly low');

const corrected = rotateVectorByQuat(result.up, result.correctionQuaternion);
assert(angleDeg(corrected, [0, 1, 0]) < 1e-5, 'correction quaternion does not map solved up to +Y');

const withReversed = solveGravity([...refs, { bottom: [0, 2, 0], top: [-0.07, 1.004, 0.05] }]);
assert(withReversed.axisResidualStats.maxDeg < 0.3, 'reversed reference incorrectly damaged axis agreement');
assert(withReversed.directionConsensus.reversedCount === 1, 'reversed direction was not explicitly reported');
assert(withReversed.directedResidualStats.maxDeg > 150, 'reversed directed residual disappeared');

const sourceToBaseline = ([x, y, z]) => [-x, -y, z];
const ownerSourceRefs = [
  [[-1.828414036416173,1.323824197295552,-0.14032697831584529],[-1.839922197275479,1.5942364123795,-0.17241008379614323]],
  [[0.6876952582552629,1.6863801937205785,-0.582413205718054],[0.693214300364842,1.4826488505226865,-0.5636190417653825]],
  [[-0.217859372660949,1.576786681741364,-0.5318687016359105],[-0.21042760699851204,1.4209279861623447,-0.5059623629429554]],
  [[-1.7166224350781047,1.744949384257733,0.36086807311275165],[-1.7003884347970564,1.3538201679749164,0.41082820089474675]],
  [[-1.1802786374416714,1.3240604919919803,-0.2796024342723406],[-1.1974161678375472,1.6839428184695573,-0.32780362758883336]]
];
const ownerRefs = ownerSourceRefs.map(([bottom, top]) => ({ bottom: sourceToBaseline(bottom), top: sourceToBaseline(top) }));
const ownerResult = solveGravity(ownerRefs);
assert(ownerResult.referenceCount === 5, 'owner evidence reference count drifted');
assert(ownerResult.axisCoherence > 0.9993, 'owner vertical axes are less coherent than recorded');
assert(ownerResult.axisResidualStats.maxDeg < 2.25, 'owner axis residual exceeded recorded bound');
assert(ownerResult.axisResidualStats.medianDeg < 0.6, 'owner median axis residual exceeded recorded bound');
assert(ownerResult.directionConsensus.reversedCount === 2, 'owner reversed endpoint count drifted');
assert(ownerResult.tiltDeg > 7 && ownerResult.tiltDeg < 8.2, 'owner tilt candidate drifted');

const ownerFlipped = ownerRefs.map((ref, index) => index === 0 || index === 4 ? { bottom: ref.top, top: ref.bottom } : ref);
const ownerFlippedResult = solveGravity(ownerFlipped);
assert(ownerFlippedResult.directionConsensus.reversedCount === 0, 'explicit endpoint correction did not resolve owner direction evidence');
assert(angleDeg(ownerFlippedResult.up, ownerResult.up) < 1e-5, 'endpoint reversal changed the underlying physical axis');

const insufficient = solveGravity([{ bottom: [0, 0, 0], top: [0, 1, 0] }]);
assert(insufficient.status === 'INSUFFICIENT', 'single reference must not become a gravity candidate');

console.log('W0.2 gravity solver + owner evidence regression: PASS');
