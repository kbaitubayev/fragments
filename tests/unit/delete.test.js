// tests/unit/delete.test.js

const request = require('supertest');
const app = require('../../src/app');
//const { createSuccessResponse } = require('../../src/response');

describe('DELETE /v1/fragments/:id', () => {
  test('deletes a fragment', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');
    const id = postRes.headers.location.split('/').pop();
    const deleteRes = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(deleteRes.statusCode).toBe(200);
    //expect(deleteRes.body).toEqual(createSuccessResponse(200));
    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(404);
  });

  test('deleting a fragment that does not exist returns 415', async () => {
    const res = await request(app)
      .delete('/v1/fragments/invalid_id')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(415);
  });
});
