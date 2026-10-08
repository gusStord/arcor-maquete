// Exploratory inputs match the anonymous 07-U02 placeholder vocabulary.
// They are not approved activities, age screening or final design assets.
export const FORMS = Object.freeze(['star', 'diamond', 'circle', 'flower']);
export const ROUTES = Object.freeze({
  orbit: ['up', 'right', 'down', 'left'],
  zigzag: ['left', 'right', 'left', 'right'],
  rise: ['up', 'up', 'up', 'up'],
  wave: ['right', 'up', 'right', 'up'],
});
export const MODES = Object.freeze({
  '4-6': 2, '7-9': 3, '10-12': 4,
});

export function selectForm(value) {
  if (!FORMS.includes(value)) throw new RangeError('Unknown form');
  return { form: value };
}

export function createBlock(mode, route) {
  if (!Object.hasOwn(MODES, mode) || !Object.hasOwn(ROUTES, route)) throw new RangeError('Unknown mode or route');
  // Facilitation mode affects the challenge only; it is never exported.
  let length = MODES[mode];
  let position = 0;
  let misses = 0;
  let completed = false;
  const target = ROUTES[route];

  function snapshot(event = 'ready') {
    return { event, next: completed ? null : target[position],
      progress: position, targetLength: length, misses, completed,
      output: completed ? { motion: route } : null };
  }

  function step(direction) {
    if (!['up', 'down', 'left', 'right'].includes(direction)) {
      throw new RangeError('Unknown direction');
    }
    if (completed) return snapshot('complete');
    if (direction !== target[position]) {
      misses += 1;
      // After two misses, an optional hint reduces the length by one while
      // preserving the family's selected route and a minimum of two actions.
      if (misses === 2) length = Math.max(2, length - 1);
      return snapshot(misses >= 2 ? 'assist' : 'adjust');
    }
    position += 1;
    if (position >= length) {
      completed = true;
      return snapshot('complete');
    }
    return snapshot('progress');
  }

  return { step, snapshot };
}

export function minimumState(form, motion, rhythm = null) {
  if (!FORMS.includes(form) || !Object.hasOwn(ROUTES, motion) ||
      ![null, 'pulse', 'alternating', 'steady', 'crescendo'].includes(rhythm)) throw new RangeError('Invalid signature');
  // Same keys/values as 07-U02. Null means Butter has not happened yet.
  return { form, motion, rhythm };
}

export function composeCompletedState(formResult, blockResult, butterResult) {
  if (!blockResult?.completed || !butterResult?.completed || !butterResult.output?.rhythm) {
    throw new RangeError('Complete all three prototypes before exporting.');
  }
  return minimumState(formResult?.form, blockResult.output?.motion, butterResult.output.rhythm);
}
