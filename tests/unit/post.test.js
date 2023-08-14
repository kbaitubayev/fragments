const request = require('supertest');
const app = require('../../src/app');

describe('post v1/fragments ', () => {
  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should post fragments
  test('authenticated users are able to post fragments', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('This is fragment')
      .set({ 'Content-type': 'text/plain' })
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(201);
  });

  // Using a valid username/password pair with image media type return 201
  test('authenticated users receive 201 from image media type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('This is fragment')
      .set({ 'Content-type': 'image/jpeg' })
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(201);
  });

  // Using a valid username/password pair with unsupported content type return 415
  test('authenticated users receive 415 from unsupported type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('This is fragment')
      .set({ 'Content-type': 'invalid/invalid' })
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(415);
  });
});
