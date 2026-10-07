import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { startFakeGitHub } from './fake-github.mjs';
import { runAction } from './run-action.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function assertNoDeprecatedCommands(result) {
  assert.doesNotMatch(result.stdout, /::set-output/);
  assert.doesNotMatch(result.stdout, /::save-state/);
  // No Node deprecation warnings (the old bundle printed DEP0169 for url.parse).
  assert.doesNotMatch(result.stderr, /DeprecationWarning/);
}

const summary = requests => requests.map(r => `${r.method} ${r.path}`);

test('removes each label with its own DELETE, in order', async () => {
  const api = await startFakeGitHub();
  try {
    const result = await runAction({
      apiUrl: api.url,
      inputs: {
        github_token: 'ghs_test_token',
        labels: 'bug\ngood first issue\n\nsize/XL',
        repo: 'octo-org/hello-world',
        number: '42'
      }
    });
    assert.equal(result.code, 0, result.stdout + result.stderr);
    assert.deepEqual(summary(api.requests), [
      'DELETE /repos/octo-org/hello-world/issues/42/labels/bug',
      'DELETE /repos/octo-org/hello-world/issues/42/labels/good%20first%20issue',
      'DELETE /repos/octo-org/hello-world/issues/42/labels/size%2FXL'
    ]);
    for (const r of api.requests) {
      assert.equal(r.authorization, 'token ghs_test_token');
    }
    assert.equal(result.stdout, '');
    assertNoDeprecatedCommands(result);
    assert.equal(result.output, '', 'the action declares no outputs');
  } finally {
    await api.close();
  }
});

test('takes the number from the triggering pull request when number is empty', async () => {
  const api = await startFakeGitHub();
  try {
    const result = await runAction({
      apiUrl: api.url,
      inputs: { github_token: 't', labels: 'needs-review', repo: 'octo-org/hello-world', number: '' },
      event: { pull_request: { number: 314 } }
    });
    assert.equal(result.code, 0, result.stdout + result.stderr);
    assert.deepEqual(summary(api.requests), [
      'DELETE /repos/octo-org/hello-world/issues/314/labels/needs-review'
    ]);
  } finally {
    await api.close();
  }
});

test('a missing label is a warning, the rest are still removed, and the step passes', async () => {
  const api = await startFakeGitHub({ missing: ['not-there'] });
  try {
    const result = await runAction({
      apiUrl: api.url,
      inputs: { github_token: 't', labels: 'bug\nnot-there\nwip', repo: 'o/r', number: '5', fail_on_error: 'false' }
    });
    assert.equal(result.code, 0, result.stdout + result.stderr);
    assert.deepEqual(summary(api.requests), [
      'DELETE /repos/o/r/issues/5/labels/bug',
      'DELETE /repos/o/r/issues/5/labels/not-there',
      'DELETE /repos/o/r/issues/5/labels/wip'
    ]);
    assert.match(result.stdout, /::warning::failed to remove label: not-there: HttpError: Label does not exist/);
    assert.match(result.stdout, /::error::Error: failed to remove labels: not-there/);
    assertNoDeprecatedCommands(result);
  } finally {
    await api.close();
  }
});

test('fail_on_error: true fails the step when a label could not be removed', async () => {
  const api = await startFakeGitHub({ missing: ['not-there'] });
  try {
    const result = await runAction({
      apiUrl: api.url,
      inputs: { github_token: 't', labels: 'not-there\nbug', repo: 'o/r', number: '5', fail_on_error: 'true' }
    });
    assert.equal(result.code, 1);
    assert.equal(api.requests.length, 2, 'still tries every label');
    assert.match(result.stdout, /::error::failed to remove labels: not-there/);
  } finally {
    await api.close();
  }
});

test('makes no API call when labels is empty', async () => {
  const api = await startFakeGitHub();
  try {
    const result = await runAction({
      apiUrl: api.url,
      inputs: { github_token: 't', labels: '', repo: 'o/r', number: '1' }
    });
    assert.equal(result.code, 0, result.stdout + result.stderr);
    assert.deepEqual(api.requests, []);
  } finally {
    await api.close();
  }
});

test('action.yml runs on node24 and keeps the upstream inputs unchanged', () => {
  const action = YAML.parse(fs.readFileSync(path.join(root, 'action.yml'), 'utf8'));
  assert.equal(action.runs.using, 'node24');
  assert.equal(action.runs.main, 'dist/index.js');
  assert.equal(action.name, '360 Bench Remove Labels');
  // Inputs exactly as in actions-ecosystem/action-remove-labels@v1.
  assert.deepEqual(action.inputs, {
    github_token: {
      description: 'A GitHub token.',
      required: false,
      default: '${{ github.token }}'
    },
    labels: {
      description:
        "The labels' name to be removed. Must be separated with line breaks if there're multiple labels.",
      required: true
    },
    repo: {
      description: 'The owner and repository name. e.g.) Codertocat/Hello-World',
      required: false,
      default: '${{ github.repository }}'
    },
    number: {
      description: 'The number of the issue or pull request.',
      required: false
    },
    fail_on_error: {
      description: 'Whether the action fails or not when getting errors. [true,false]',
      default: 'false',
      required: false
    }
  });
  assert.equal(action.outputs, undefined, 'upstream declares no outputs');
});
