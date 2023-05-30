// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('test 404 occur', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('return 404 response', () => request(app).get('/undefined').expect(404));

  // TODO: we'll need to add tests to check the contents of the fragments array later
});
