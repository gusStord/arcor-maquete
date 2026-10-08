// 07-U08 exploratory timing model. These values are test parameters, not approved mechanics.
export const DEFAULTS = Object.freeze({
  targetPairs: 3,
  baseWindowMs: 350,
  adaptedWindowMs: 600,
  idleResetMs: 4000,
});

export function createRhythm(overrides = {}) {
  const config = { ...DEFAULTS, ...overrides };
  if (!Number.isInteger(config.targetPairs) || config.targetPairs < 1 ||
      !['baseWindowMs', 'adaptedWindowMs', 'idleResetMs'].every(k => Number.isFinite(config[k]) && config[k] > 0) ||
      config.adaptedWindowMs < config.baseWindowMs || config.idleResetMs <= config.adaptedWindowMs) {
    throw new RangeError('Invalid rhythm timing parameters.');
  }
  let lastEventAt = -1, lastPulseAt = null;
  const state = {
    pending: [null, null], pairs: 0, misses: 0, adapted: false,
    completed: false, startedAt: null, completedAt: null,
  };

  function snapshot(event = 'ready') {
    return { event, pairs: state.pairs, misses: state.misses,
      adapted: state.adapted, completed: state.completed,
      // Candidate marker for the shared pulse gesture, not a measured personal rhythm.
      output: state.completed ? { rhythm: 'pulse' } : null,
      elapsedMs: state.completedAt === null || state.startedAt === null
        ? null : state.completedAt - state.startedAt };
  }

  function advance(atMs) {
    if (!Number.isFinite(atMs) || atMs < 0 || atMs < lastEventAt) {
      throw new RangeError('Events must arrive in nonnegative time order.');
    }
    lastEventAt = atMs;
    if (!state.completed && lastPulseAt !== null && atMs - lastPulseAt >= config.idleResetMs) {
      state.pending = [null, null]; state.pairs = 0; state.misses = 0;
      state.adapted = false; state.startedAt = null; lastPulseAt = null;
      return true;
    }
    return false;
  }

  function pulse(participant, atMs) {
    if (![0, 1].includes(participant) || !Number.isFinite(atMs) || atMs < 0) {
      throw new TypeError('Participant must be 0 or 1, with a nonnegative time.');
    }
    advance(atMs);
    if (state.completed) return snapshot('complete');
    lastPulseAt = atMs;
    if (state.startedAt === null) state.startedAt = atMs;
    const other = 1 - participant;
    const windowMs = state.adapted ? config.adaptedWindowMs : config.baseWindowMs;
    if (state.pending[other] !== null) {
      const gap = atMs - state.pending[other];
      if (gap < 0) throw new RangeError('Pulses must arrive in time order.');
      if (gap <= windowMs) {
        state.pending = [null, null];
        state.pairs += 1;
        if (state.pairs >= config.targetPairs) {
          state.completed = true;
          state.completedAt = atMs;
          return snapshot('complete');
        }
        return snapshot('paired');
      }
      state.pending[other] = null;
      state.misses += 1;
      state.adapted = true;
    }
    // A second pulse by the same person replaces their previous unmatched pulse.
    // It cannot count as cooperation.
    state.pending[participant] = atMs;
    return snapshot(state.misses ? 'adjust' : 'waiting');
  }

  function tick(atMs) {
    return snapshot(advance(atMs) ? 'idle' : state.completed ? 'complete' : 'ready');
  }

  return { pulse, tick, snapshot };
}
