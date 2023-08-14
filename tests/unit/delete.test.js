const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Authenticated users with correct content-type can delete the existing fragment
  test('authenticated users can delete a fragment', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .send('this is a fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');
    const id = postRes.body.fragment.id;
    const deleteRes = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.status).toBe('ok');
  });

  // if the fragment is not found by id, it return 404 Not Found
  test('If the id is not found, returns an HTTP 404 with an appropriate error message', async () => {
    const deleteRes = await request(app)
      .delete(`/v1/fragments/notexistid`)
      .auth('user1@email.com', 'password1');
    expect(deleteRes.statusCode).toBe(404);
  });
});
