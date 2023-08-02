const knex = require('./knex');

module.exports = {
  getCurrentRecord: () => {
    return knex('cases_and_deaths').select().first();
  },
  upsertRecord: ({ currentEtag, newData, newEtag }) => {
    const newRecord = {
      last_fetched_timestamp: new Date(Date.now()),
      etag: newEtag,
      data: newData,
    };
    if (currentEtag) {
      return knex('cases_and_deaths')
        .where({ etag: currentEtag })
        .update(newRecord, ['etag', 'data']);
    } else {
      return knex('cases_and_deaths').insert(newRecord).returning('data');
    }
  },
};
