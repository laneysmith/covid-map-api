exports.seed = (knex) =>
  knex('cases_and_deaths')
    .del()
    .then(() =>
      knex('cases_and_deaths').insert([
        {
          etag: 'W/"2dcd4781a59679ce1ea62cb50670bb547c169ad00ce867b711fffbdd1540a61e"',
          data: {
            data: {
              '2020-03-03': {
                '17031': {
                  cases: 4,
                  deaths: 0,
                },
                '53061': {
                  cases: 5,
                  deaths: 0,
                },
                '06059': {
                  cases: 3,
                  deaths: 0,
                },
              },
              '2020-03-04': {
                '17031': {
                  cases: 4,
                  deaths: 0,
                },
                '53061': {
                  cases: 8,
                  deaths: 0,
                },
                '06059': {
                  cases: 3,
                  deaths: 0,
                },
              },
              '2020-03-05': {
                '17031': {
                  cases: 5,
                  deaths: 0,
                },
                '53061': {
                  cases: 17,
                  deaths: 0,
                },
                '06059': {
                  cases: 3,
                  deaths: 0,
                },
              },
            },
            maxCases: 17,
            maxDeaths: 0,
          },
        },
      ])
    );
