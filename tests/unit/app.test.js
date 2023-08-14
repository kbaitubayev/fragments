const request = require('supertest');

const app = require('../../src/app');

describe('404 middleware test', () => {
  test('should return HTTP 404 not found', async () => {
    const res = await request(app).get('/error');
    //expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
    expect(res.body.error.message).toBe('not found');
  });
});
