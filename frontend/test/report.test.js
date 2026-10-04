import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration } from '../src/utils/report.js';

test('formata duração média em segundos, minutos e horas', () => {
  assert.equal(formatDuration(32.6), '33 s');
  assert.equal(formatDuration(125), '2 min 5 s');
  assert.equal(formatDuration(3725), '1 h 2 min');
});

test('exibe ausência de duração sem inventar um valor', () => {
  for (const value of [null, undefined, '', -1, Number.NaN]) {
    assert.equal(formatDuration(value), '—');
  }
});
