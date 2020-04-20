const knex = require('./knex');

module.exports = {
  getCurrentRecord: () => {
    return knex('cases_and_deaths').select().first();
  },
  updateDataAndEtagRecord: (data, etag) => {
    return knex('cases_and_deaths')
      .select()
      .first()
      .then((foundRecord) => {
        console.log('foundRecord :', foundRecord);
        console.log('etag :', etag);
        knex('cases_and_deaths').where({ id: foundRecord.id }).update({ etag, data }, ['data']);
      });
  },
  createDataAndEtagRecord: (data, etag) => {
    return knex('cases_and_deaths').insert({ data, etag }).returning('data');
  },
};
