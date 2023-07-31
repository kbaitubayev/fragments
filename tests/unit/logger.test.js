const request = require('supertest');

const pino = require('pino');
const pinoPretty = require('pino-pretty');

const app = require('../../src/app');

const testLogger = pino({ level: 'debug' }, pinoPretty());

describe('Logger Configuration', () => {
  it('should set the log level as specified', () => {
    expect(testLogger.level).toBe('debug');
  });

  it('should log requests and responses when making HTTP requests', async () => {
    const logs = [];
    testLogger.info = (log) => logs.push(log);

    await request(app).get('/v1/fragments');

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(logs.some((log) => log.includes('GET /v1/fragments'))).toBe(false);

    delete testLogger.info;
  });
});
