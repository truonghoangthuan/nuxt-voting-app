import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileVotes, buildVoteActivity, type ReconcileOption } from '../server/utils/reconcile.ts';

test('reconcileVotes: adds vote when option newly selected', () => {
  const options: ReconcileOption[] = [
    { id: 'opt1', text: 'Option 1', votes: 0, voters: [], voterIds: [] },
    { id: 'opt2', text: 'Option 2', votes: 0, voters: [], voterIds: [] },
  ];

  const result = reconcileVotes(options, ['opt1'], 'user1', 'Alice');

  assert.equal(result[0].votes, 1);
  assert.deepEqual(result[0].voterIds, ['user1']);
  assert.deepEqual(result[0].voters, ['Alice']);
  assert.equal(result[1].votes, 0);
  assert.deepEqual(result[1].voterIds, []);
});

test('reconcileVotes: deselecting option decrements votes and removes voter', () => {
  const options: ReconcileOption[] = [
    { id: 'opt1', text: 'Option 1', votes: 1, voters: ['Alice'], voterIds: ['user1'] },
    { id: 'opt2', text: 'Option 2', votes: 0, voters: [], voterIds: [] },
  ];

  const result = reconcileVotes(options, ['opt2'], 'user1', 'Alice');

  assert.equal(result[0].votes, 0);
  assert.deepEqual(result[0].voterIds, []);
  assert.deepEqual(result[0].voters, []);
  assert.equal(result[1].votes, 1);
  assert.deepEqual(result[1].voterIds, ['user1']);
  assert.deepEqual(result[1].voters, ['Alice']);
});

test('reconcileVotes: keeping previously voted option does not duplicate vote', () => {
  const options: ReconcileOption[] = [
    { id: 'opt1', text: 'Option 1', votes: 1, voters: ['Alice'], voterIds: ['user1'] },
    { id: 'opt2', text: 'Option 2', votes: 0, voters: [], voterIds: [] },
  ];

  const result = reconcileVotes(options, ['opt1', 'opt2'], 'user1', 'Alice');

  assert.equal(result[0].votes, 1);
  assert.deepEqual(result[0].voterIds, ['user1']);
  assert.deepEqual(result[0].voters, ['Alice']);
  assert.equal(result[1].votes, 1);
  assert.deepEqual(result[1].voterIds, ['user1']);
  assert.deepEqual(result[1].voters, ['Alice']);
});

test('reconcileVotes: deselecting option with voterName removes correct voter name even if voterIds desynced', () => {
  const options: ReconcileOption[] = [
    { id: 'opt1', text: 'Option 1', votes: 2, voters: ['Bob'], voterIds: ['userWithoutName', 'userAlice'] },
  ];

  // Alice had no name in voters, but passes voterName 'Alice' now; Bob must not be deleted
  const result = reconcileVotes(options, [], 'userAlice', 'Alice');

  assert.equal(result[0].votes, 1);
  assert.deepEqual(result[0].voterIds, ['userWithoutName']);
  assert.deepEqual(result[0].voters, ['Bob']);
});

test('reconcileVotes: deselecting option without voterName does not delete other user name', () => {
  const options: ReconcileOption[] = [
    { id: 'opt1', text: 'Option 1', votes: 2, voters: ['Bob'], voterIds: ['userWithoutName', 'userBob'] },
  ];

  const result = reconcileVotes(options, [], 'userWithoutName', undefined);

  assert.equal(result[0].votes, 1);
  assert.deepEqual(result[0].voterIds, ['userBob']);
  assert.deepEqual(result[0].voters, ['Bob']);
});

test('reconcileVotes: fallback without userId increments votes', () => {
  const options: ReconcileOption[] = [
    { id: 'opt1', text: 'Option 1', votes: 0, voters: [], voterIds: [] },
  ];

  const result = reconcileVotes(options, ['opt1'], undefined, 'Bob');

  assert.equal(result[0].votes, 1);
  assert.deepEqual(result[0].voters, ['Bob']);
});

test('buildVoteActivity: returns vote activity when user casts first vote', () => {
  const options: ReconcileOption[] = [
    { id: 'opt1', text: 'Pizza', votes: 0, voters: [], voterIds: [] },
    { id: 'opt2', text: 'Sushi', votes: 0, voters: [], voterIds: [] },
  ];

  const activity = buildVoteActivity(options, ['opt1'], 'user1', 'Alice', 1700000000000);

  assert.ok(activity);
  assert.equal(activity.type, 'vote');
  assert.equal(activity.actorName, 'Alice');
  assert.equal(activity.actorId, 'user1');
  assert.deepEqual(activity.optionTexts, ['Pizza']);
  assert.equal(activity.createdAt, 1700000000000);
});

test('buildVoteActivity: returns change_vote activity when user switches options', () => {
  const options: ReconcileOption[] = [
    { id: 'opt1', text: 'Pizza', votes: 1, voters: ['Alice'], voterIds: ['user1'] },
    { id: 'opt2', text: 'Sushi', votes: 0, voters: [], voterIds: [] },
  ];

  const activity = buildVoteActivity(options, ['opt2'], 'user1', 'Alice', 1700000001000);

  assert.ok(activity);
  assert.equal(activity.type, 'change_vote');
  assert.deepEqual(activity.previousOptionTexts, ['Pizza']);
  assert.deepEqual(activity.optionTexts, ['Sushi']);
});

test('buildVoteActivity: returns unvote activity when user clears all selected options', () => {
  const options: ReconcileOption[] = [
    { id: 'opt1', text: 'Pizza', votes: 1, voters: ['Alice'], voterIds: ['user1'] },
  ];

  const activity = buildVoteActivity(options, [], 'user1', 'Alice', 1700000002000);

  assert.ok(activity);
  assert.equal(activity.type, 'unvote');
  assert.deepEqual(activity.previousOptionTexts, ['Pizza']);
  assert.deepEqual(activity.optionTexts, ['Pizza']);
});

test('buildVoteActivity: returns null when selection did not change', () => {
  const options: ReconcileOption[] = [
    { id: 'opt1', text: 'Pizza', votes: 1, voters: ['Alice'], voterIds: ['user1'] },
  ];

  const activity = buildVoteActivity(options, ['opt1'], 'user1', 'Alice', 1700000003000);

  assert.equal(activity, null);
});
