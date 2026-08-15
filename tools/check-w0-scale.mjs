import { solveScale } from '../world-lab/scale.mjs';

function assert(condition, message) { if (!condition) throw new Error(message); }

const clean = solveScale([
  { sourceLength: 0.5, knownMetres: 2 },
  { sourceLength: 1.251, knownMetres: 5 },
  { sourceLength: 2.498, knownMetres: 10 }
]);
assert(clean.status === 'CANDIDATE', 'scale solver did not produce candidate');
assert(Math.abs(clean.unitsPerMetre - 0.25) < 0.001, 'scale solver drifted from synthetic truth');
assert(clean.consistency.maxAbsRelativeResidualPct < 0.5, 'clean synthetic residual unexpectedly high');
assert(clean.silentOutlierRemoval === false, 'solver must never silently trim measurements');
assert(clean.automaticAcceptance === false, 'solver must not self-accept');

const withConflict = solveScale([
  { sourceLength: 0.5, knownMetres: 2 },
  { sourceLength: 1.25, knownMetres: 5 },
  { sourceLength: 3.5, knownMetres: 10 }
]);
assert(withConflict.measurementCount === 3, 'conflicting measurement disappeared');
assert(withConflict.consistency.maxAbsRelativeResidualPct > 10, 'conflicting measurement was not exposed');

const insufficient = solveScale([{ sourceLength: 1, knownMetres: 4 }]);
assert(insufficient.status === 'INSUFFICIENT', 'single measurement must not become final scale candidate');

console.log('W0.3 scale solver check: PASS');
