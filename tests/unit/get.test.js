const request = require('supertest');
const app = require('../../src/app');

// JEST Manual Mocks - https://jestjs.io/docs/manual-mocks
const fs = require('fs');

/////////////////////////////////////////////////////////////////////////////////////////////
describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  /*test('incorrect credentials are denied', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password');
    expect(401);
    expect(res.body.error.message).toBe('Unauthorized');
  });*/

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // When fragments can't get byUser function; Returns 404 status
  test('invalid id returns 401 status code ', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password111');
    expect(res.statusCode).toBe(401);
  });

  // Test users can get their fragments when ?expand=1
  test('authenticated users get a fragments ?expand=1', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////
describe('GET /fragments/:id', () => {
  // No auth returns unauthrized 401 status code
  test('unauthenticated requests should returns error', async () =>
    await request(app).get('/v1/fragments/id').expect(401));

  // Wrong username and password returns unauthrized 401
  test('incorrect credentials are denied to access; returns unauthrized 401 ', async () =>
    await request(app)
      .get('/v1/fragments/id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // Using a valid id returns 200 status
  test('valid id returns 200', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
  });

  // Using an invalid id returns 400 status
  test('invalid id returns 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/invalid')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////
describe('GET /fragments/:id/info', () => {
  // When text fragment is created and returned; request succeeded 200 (201 is created)
  test('Info: returns an existing fragments metadata', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send({
        body: 'text fragment',
        type: 'text/plain',
      });
    const id = await createRes.body.fragment.id;
    const res = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  // Invalid info returns 404 status
  test('Info: invalid id returns 404 status code for info', async () => {
    const res = await request(app)
      .get('/v1/fragments/invalid/info')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////
// EXTENTION
describe('GET /fragments/:id.ext', () => {
  // Returns an existing fragment's data converted to a supported type
  test('.ext: Support Markdown fragments (.md) converted to HTML (.html)', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send({
        body: 'text fragment',
        //type: 'text/plain'
      });
    const id = await createRes.body.fragment.id;
    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
  });

  // Test the body
  test(`verify the body if the fragment is changed from text to md`, async () => {
    const md = 'This is a fragment';
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send(md);
    const res = await request(app)
      .get(`/v1/fragments/${createRes.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');
    expect(res.text).toBe(`${md}`);
  });

  // Returns an existing fragment's data converted to a supported type
  test('.ext: check if .txt is supported type', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send({
        body: 'text fragment',
        type: 'text/plain',
      });
    const id = await createRes.body.fragment.id;
    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
  });

  /*// Convert from text to json
  test('verify the body if the fragment is changed from text to json', async () => {
    const json = '{ "This is a fragment" }';
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send(json);
    const id = createRes.body.fragment.id;
    const res = await request(app)
      .get(`/v1/fragments/${id}.json`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
  });*/

  // readFileSync function in fs
  // https://www.digitalocean.com/community/tutorials/nodejs-how-to-use__dirname
  // https://www.tabnine.com/code/javascript/functions/fs/readFileSync
  // Convert from jpg to png
  test(`verify the fragment is converted from jpg to png`, async () => {
    const createRes = await request(app)
      .post('/v1/fragments/')
      .set('Content-type', 'image/jpg')
      .auth('user1@email.com', 'password1')
      .send(fs.readFileSync(`${__dirname}/image/testpic.jpg`));
    const res = await request(app)
      .get(`/v1/fragments/${createRes.body.fragment.id}.jpg`)
      .auth('user1@email.com', 'password1');
    expect(res.type).toBe('image/jpg');
    expect(res.statusCode).toBe(200);
  });

  // Convert from jpg to gif
  test(`verify the fragment is converted from jpg to gif`, async () => {
    const createRes = await request(app)
      .post('/v1/fragments/')
      .set('Content-type', 'image/jpg')
      .auth('user1@email.com', 'password1')
      .send(fs.readFileSync(`${__dirname}/image/testpic.jpg`));
    const res = await request(app)
      .get(`/v1/fragments/${createRes.body.fragment.id}.gif`)
      .auth('user1@email.com', 'password1');
    expect(res.type).toBe('image/gif');
    expect(res.statusCode).toBe(200);
  });
  // Convert from jpg to webp
  test(`verify the fragment is converted from jpg to gif`, async () => {
    const createRes = await request(app)
      .post('/v1/fragments/')
      .set('Content-type', 'image/jpg')
      .auth('user1@email.com', 'password1')
      .send(fs.readFileSync(`${__dirname}/image/testpic.jpg`));
    const res = await request(app)
      .get(`/v1/fragments/${createRes.body.fragment.id}.webp`)
      .auth('user1@email.com', 'password1');
    expect(res.type).toBe('image/webp');
    expect(res.statusCode).toBe(200);
  });
});
