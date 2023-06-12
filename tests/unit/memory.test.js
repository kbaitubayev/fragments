const memory = require('../../src/model/data/memory');

describe('memory.test.js read/write check', () => {
  test('writeFragment - should return void Promise', async () => {
    const fragment = {
      id: 'FragmentId',
      ownerId: 'OwnerId',
      created: '2021-11-02T15:09:50.403Z',
      updated: '2021-11-02T15:09:50.403Z',
      type: 'text/plain',
      size: 256,
    };
    const result = await memory.writeFragment(fragment);
    expect(result).toBe(undefined);
  });

  test('writeFragmentData - should return void Promise', async () => {
    const data = Buffer.from('test');
    const result = await memory.writeFragmentData('OwnerId', 'FragmentId', data);
    expect(result).toBe(undefined);
  });

  test('readFragment - should return Promise with fragment object', async () => {
    const result = await memory.readFragment('OwnerId', 'FragmentId');
    expect(result && typeof result === 'object').toBe(true);
  });

  test('readFragmentData - should return Promise', async () => {
    const result = await memory.readFragment('OwnerId', 'FragmentId');
    await expect(result && typeof result === 'object').toBe(true);
  });
});
