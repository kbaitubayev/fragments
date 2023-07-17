// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
  describe('GET /v1/fragments/:id', () => {
    test('fetch by ID should return the existing fragment', async () => {
      const response = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .send({
          body: 'This is a fragment',
        });
      const id = await response.body.fragment.id;

      const res = await request(app)
        .get(`/v1/fragments/${id}`)
        .auth('user1@email.com', 'password1');
      expect(res.statusCode).toBe(200);
    });
  });
  describe('GET /v1/fragments/:id.ext', () => {
    test('unauthenticated requests are denied', () =>
      request(app).get('/v1/fragments/:id.ext').expect(401));

    test('fetch by ID.ext should return the existing fragment in the selected content type', async () => {
      const response = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .send({
          body: 'This is a fragment',
        });
      const id = await response.body.fragment.id;

      const res = await request(app)
        .get(`/v1/fragments/${id}.txt`)
        .auth('user1@email.com', 'password1');
      expect(res.statusCode).toBe(200);
    });

    test('fetch by ID should return Invalid Type for unsupported conversion', async () => {
      const response = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .send({
          body: 'This is a fragment',
        });
      const id = await response.body.fragment.id;

      const res = await request(app)
        .get(`/v1/fragments/${id}.jpg`)
        .auth('user1@email.com', 'password1');
      expect(res.statusCode).toBe(415);
    });
  });

  describe('GET /v1/fragments/:id/info', () => {
    test('fetch by ID should return the existing fragment metadata', async () => {
      const response = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .send({
          body: 'This is a fragment',
        });
      const id = await response.body.fragment.id;

      const res = await request(app)
        .get(`/v1/fragments/${id}/info`)
        .auth('user1@email.com', 'password1');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    test('unauthenticated requests are denied', () =>
      request(app).get('/v1/fragments').expect(401));
  });
  test('.html to .txt', async () => {
    const data = Buffer.from('This is fragment');
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send(data);

    const id = postRes.headers.location.split('/').pop();

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toMatch(/text\/plain/);
    expect(getRes.text).toBe(data.toString());
  });
  // If the extension used represents an unknown or unsupported type, or if the fragment cannot be converted to this type,
  // an HTTP 415 error is returned instead, with an appropriate message. For example, a plain text fragment cannot be returned as a PNG.
  test('if fragment cannot be converted to the extension type used, returns 415 error', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');
    const id = JSON.parse(postRes.text).fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.exe`)
      .auth('user2@email.com', 'password2');

    expect(getRes.statusCode).toBe(415);
  });

  // convert md to html
  test('markdown data can be converted to html, user can get converted result by specifying extension', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# This is fragment');
    const id = JSON.parse(postRes.text).fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toEqual('text/html; charset=utf-8');
  });
});
