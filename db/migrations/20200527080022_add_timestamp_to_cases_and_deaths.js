exports.up = (knex, Promise) =>
  knex.schema.table('cases_and_deaths', (table) => {
    table.dateTime('last_fetched_timestamp', { useTz: true }).notNull();
  });

exports.down = (knex, Promise) =>
  knex.schema.table('cases_and_deaths', (table) => {
    table.dropColumn('last_fetched_timestamp');
  });
