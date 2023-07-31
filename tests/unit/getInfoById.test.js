const request = require('supertest');
const app = require('../../src/app');

describe('Checking fragments/:id/info', () => {
  test('Check get success id', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    const id = resPost.body.fragments.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1')
      .send('new fragment');
    expect(res.status).toBe(200);
  });

  test('Check get failed due to not valid id', async () => {
    const res = await request(app)
      .get(`/v1/fragments/999/info`)
      .auth('user1@email.com', 'password1')
      .send('new fragment');
    expect(res.status).toBe(415);
  });
});
