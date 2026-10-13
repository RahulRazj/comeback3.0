const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');

test('revision persists, feeds the due queue, and backlog clears on completion', async () => {
  const originalDirectory = process.cwd();
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'progress-test-'));
  const previousLoader = require.extensions['.ts'];
  require.extensions['.ts'] = (loadedModule, filename) => {
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    loadedModule._compile(compiled, filename);
  };

  try {
    process.chdir(temporaryDirectory);
    const repository = require(path.join(__dirname, '../src/lib/db.ts'));
    const [topic] = (await repository.getTopics()).filter((entry) => entry.day_target === 1);
    assert.ok(topic);
    const dueDate = new Date(Date.now() - 1000).toISOString();
    await repository.updateTopic(topic.id, { next_review_at: dueDate });
    const filePath = path.join(temporaryDirectory, 'data/progress.json');
    const saved = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(saved.topics.find((entry) => entry.id === topic.id).next_review_at, dueDate);
    assert.equal(saved.topics.find((entry) => entry.id === topic.id).status, 'pending');
    assert.equal(saved.reviews.length, 0);
    assert.equal(saved.daily_logs.length, 0);

    global.__progress_cache = undefined;
    assert.ok((await repository.getTopics({ dueOnly: true })).some((entry) => entry.id === topic.id));
    assert.ok((await repository.getDashboardMetrics()).dueForReview.some((entry) => entry.id === topic.id));

    saved.settings.start_date = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    fs.writeFileSync(filePath, JSON.stringify(saved));
    global.__progress_cache = undefined;
    assert.equal((await repository.getDashboardMetrics()).backlog.find((entry) => entry.topic.id === topic.id).daysOverdue, 2);
    await repository.updateTopic(topic.id, { status: 'completed' });
    assert.ok(!(await repository.getDashboardMetrics()).backlog.some((entry) => entry.topic.id === topic.id));

    await repository.recordTopicReview(topic.id, 3, 'remembered');
    assert.ok(!(await repository.getTopics({ dueOnly: true })).some((entry) => entry.id === topic.id));
    assert.equal((await repository.getReviewHistory()).length, 1);
  } finally {
    process.chdir(originalDirectory);
    global.__progress_cache = undefined;
    if (previousLoader) require.extensions['.ts'] = previousLoader;
    else delete require.extensions['.ts'];
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});