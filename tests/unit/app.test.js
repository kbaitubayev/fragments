// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('Test the Express app', () => {
  test('GET / should return 404 not found', async () => {
    const response = await request(app).get('/nopage');
    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
    expect(response.body.error.message).toBe('not found');
  });

  test('POST / should return 415 unsupported media type', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('fragment')
      .set('content-type', 'exe/file');
    expect(response.status).toBe(415);
    expect(response.body.status).toBe('error');
  });

  const largePayload = Buffer.alloc(11 * 1024 * 1024);

  test('POST / should return 400 Invalid size value', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      // .send('fragment')
      .set('Content-Length', largePayload.length.toString())
      .send(largePayload)
      .set('content-type', 'text/plain');
    expect(response.status).toBe(413);
    expect(response.body.status).toBe('error');
  });

  // Add more tests for other routes and error scenarios as needed
});
