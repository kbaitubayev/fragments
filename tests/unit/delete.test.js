const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments', () => {
  test('Check delete() pass', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('fragment');

    const id = resPost.body.fragments.id;

    const res = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(res.status).toBe(200);
  });

  test('Check delete() not exist user', async () => {
    const res = await request(app).delete(`/v1/fragments/123`).auth('user1@email.com', 'password1');
    expect(res.status).toBe(415);
  });
});
