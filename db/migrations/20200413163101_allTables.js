exports.up = (knex, Promise) =>
  knex.schema.createTable('cases_and_deaths', (table) => {
    table.increments();
    table.string('etag');
    table.jsonb('data');
  });

exports.down = (knex, Promise) => knex.schema.dropTableIfExists('cases_and_deaths');
