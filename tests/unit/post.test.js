const request = require('supertest');
const app = require('../../src/app');
//const crypto = require('crypto');

describe('POST /v1/fragments', () => {
  // If the user is not authenticated, it should receive a 401 error
  test('unauthenticated user should receive 401 error', () =>
    request(app).post('/v1/fragments').expect(401));

  //  If the user credentials are incorrect, it should receive a 401 error
  test('incorrect credentials should receive 401 error', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // unauthenticated users should receive an empty array
  test('authenticated users get an empty fragment', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('fragment without data does not work', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send();
    expect(res.statusCode).toBe(500);
  });

  // unsupported content type should throw 415 error
  test('unsupported content-type throw 415 error', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/jpg');
    expect(res.statusCode).toBe(415);
  });

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('fragment')
      .set('content-type', 'text/plain');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    //expect(res.body.fragments != null).toBe(true);
  });
});
