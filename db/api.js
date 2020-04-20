const knex = require('./knex');

module.exports = {
  getCurrentRecord: () => {
    return knex('cases_and_deaths').select().first();
  },
  upsertRecord: ({ currentEtag, newData, newEtag }) => {
    if (currentEtag) {
      console.log('Updating record...');
      return knex('cases_and_deaths')
        .where({ etag: currentEtag })
        .update({ etag: newEtag, data: newData }, ['etag', 'data']);
    } else {
      console.log('Creating new record...');
      return knex('cases_and_deaths').insert({ data: newData, etag: newEtag }).returning('data');
    }
  },
};
