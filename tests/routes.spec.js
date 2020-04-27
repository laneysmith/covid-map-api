const request = require('supertest');
const fetch = require('node-fetch');
const { Response, Headers } = require('node-fetch');
const { readFileSync } = require('fs');
const { join } = require('path');

const server = require('../index');
const knex = require('../db/knex');
const db = require('../db/api');

const migrateAndSeedDatabase = async () => {
  await knex.migrate.rollback();
  await knex.migrate.latest();
  await knex.seed.run();
};

const migrateDatabase = async () => {
  await knex.migrate.rollback();
  await knex.migrate.latest();
};

describe('API routes', () => {
  afterAll(async () => {
    await knex.migrate.rollback();
  });

  describe('GET /covid', () => {
    const getCurrentRecordSpy = jest.spyOn(db, 'getCurrentRecord');
    const upsertRecordSpy = jest.spyOn(db, 'upsertRecord');

    describe('when conditional request to github returns 500', () => {
      it('should return current record from database', async () => {
        await migrateAndSeedDatabase();
        const fetchSpy = jest
          .spyOn(fetch, 'Promise')
          .mockImplementationOnce(() => Promise.resolve({ status: 500 }));

        const res = await request(server).get('/covid');

        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(
          expect.objectContaining({
            '2020-03-03': expect.any(Object),
          })
        );
        expect(res.body.maxCases).toEqual(17);
        expect(res.body.maxDeaths).toEqual(0);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(getCurrentRecordSpy).toHaveBeenCalledTimes(1);
        expect(upsertRecordSpy).not.toHaveBeenCalled();
      });

      it('should return 500 error if database is empty', async () => {
        await migrateDatabase();
        const fetchSpy = jest
          .spyOn(fetch, 'Promise')
          .mockImplementationOnce(() => Promise.resolve({ status: 500 }));

        const res = await request(server).get('/covid');

        expect(res.status).toEqual(500);
        expect(res.body.message).toEqual('Failed to retrieve Covid-19 data.');
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(getCurrentRecordSpy).toHaveBeenCalledTimes(1);
        expect(upsertRecordSpy).not.toHaveBeenCalled();
      });
    });

    describe('when conditional request to github returns 304', () => {
      it('should return current record from database', async () => {
        await migrateAndSeedDatabase();
        const fetchSpy = jest
          .spyOn(fetch, 'Promise')
          .mockImplementation(() => Promise.resolve({ status: 304 }));

        const res = await request(server).get('/covid');

        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(
          expect.objectContaining({
            '2020-03-03': expect.any(Object),
          })
        );
        expect(res.body.maxCases).toEqual(17);
        expect(res.body.maxDeaths).toEqual(0);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(getCurrentRecordSpy).toHaveBeenCalledTimes(1);
        expect(upsertRecordSpy).not.toHaveBeenCalled();
      });
    });

    describe('when conditional request to github returns 200', () => {
      it('should update database and return new data', async () => {
        await migrateAndSeedDatabase();
        const headers = new Headers({ ETag: 'W/"some-new-etag"' });
        const dataAsString = readFileSync(join(__dirname, 'test_data.csv'), 'utf8').toString();
        const responsePromise = Promise.resolve({
          status: 200,
          headers,
          text: () => dataAsString,
        });
        const fetchSpy = jest
          .spyOn(fetch, 'Promise')
          .mockImplementation(() => Promise.resolve(responsePromise));

        const res = await request(server).get('/covid');

        const transformedData = {
          '2020-01-21': { '53061': { cases: 18, deaths: 0 } },
          '2020-01-22': { '53061': { cases: 19, deaths: 0 } },
          '2020-01-23': { '53061': { cases: 20, deaths: 1 } },
          '2020-01-24': { '53061': { cases: 21, deaths: 2 }, '17031': { cases: 1, deaths: 0 } },
          '2020-01-25': {
            '06059': { cases: 1, deaths: 0 },
            '17031': { cases: 1, deaths: 0 },
            '53061': { cases: 22, deaths: 3 },
          },
          '2020-01-26': {
            '04013': { cases: 1, deaths: 0 },
            '06037': { cases: 1, deaths: 0 },
            '06059': { cases: 1, deaths: 0 },
            '17031': { cases: 1, deaths: 0 },
            '53061': { cases: 23, deaths: 4 },
          },
        };

        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(transformedData);
        expect(res.body.maxCases).toEqual(23);
        expect(res.body.maxDeaths).toEqual(4);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(getCurrentRecordSpy).toHaveBeenCalledTimes(1);
        expect(getCurrentRecordSpy).toHaveBeenCalledTimes(1);
        expect(upsertRecordSpy).toHaveBeenCalledWith({
          currentEtag: 'W/"2dcd4781a59679ce1ea62cb50670bb547c169ad00ce867b711fffbdd1540a61e"',
          newEtag: 'W/"some-new-etag"',
          newData: { data: transformedData, maxCases: 23, maxDeaths: 4 },
        });
      });
    });
  });
});
