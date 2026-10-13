const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '../src/lib/backlog.ts');
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loadedModule = new Module(sourcePath, module);
loadedModule._compile(compiled, sourcePath);
const { getBacklog } = loadedModule.exports;

const topic = (id, day_target, status = 'pending', priority = 1) => ({ id, day_target, status, priority });

test('includes only unfinished work scheduled before today', () => {
  const entries = getBacklog([
    topic('missed', 1), topic('started', 2, 'in_progress'),
    topic('done', 1, 'completed'), topic('mastered', 1, 'mastered'),
    topic('today', 3), topic('future', 4),
  ], '2026-10-05', new Date('2026-10-07T23:59:59Z'));
  assert.deepEqual(entries.map((entry) => [entry.topic.id, entry.scheduledDate, entry.daysOverdue]), [
    ['missed', '2026-10-05', 2], ['started', '2026-10-06', 1],
  ]);
});

test('is empty before and on the first journey day', () => {
  for (const date of ['2026-10-04', '2026-10-05']) {
    assert.deepEqual(getBacklog([topic('first', 1)], '2026-10-05', new Date(`${date}T12:00:00Z`)), []);
  }
});

test('includes Day 90 after the journey ends and orders ties by priority', () => {
  const entries = getBacklog([topic('low', 90, 'pending', 3), topic('high', 90)],
    '2026-01-01', new Date('2026-04-01T00:00:00Z'));
  assert.deepEqual(entries.map((entry) => [entry.topic.id, entry.daysOverdue]), [['high', 1], ['low', 1]]);
});