# Covid-19 Map API

This is the API and database source code for [https://covid.laney.tech](https://covid.laney.tech/), an interactive map displaying cumulative Covid-19 cases and deaths for US counties. The front end source code can be found at [https://github.com/laneysmith/covid-map](https://github.com/laneysmith/covid-map).

Data from [the NY Times covid-19-data project](https://github.com/nytimes/covid-19-data), based on reports from state and local health agencies.

## Running the App Locally

**Prerequisites**

1. You must have postgres installed on your machine ([download here](https://www.postgresql.org/download/)).

**Starting the App**

1. Install project dependencies: `yarn install`
1. Run `yarn copy-env` to copy the `.env.example` contents into a new `.env` file.
1. Create a new postgres database called `covid_19`:
   ```bash
   psql # enter the interactive postgres terminal
   CREATE DATABASE covid_19; # create the database; if you choose to name it anything
   # other than covid_19, make sure you update the DATABASE_NAME env variable to match.
   \l # list all databases; confirm that covid_19 exists
   \q # exit postgres shell
   ```
1. Run `knex migrate:latest --env development` (from the project root, _not_ in psql) to run the migrations. This will add a table to the postgres database you created.
1. Start the server: `yarn start`
1. You should now be able to run `curl -i http://localhost:5000/covid` in your terminal to retrieve the latest data.

## Testing

1. Create a new postgres test database called `covid_19_test`:
   ```bash
   psql # enter the interactive postgres terminal
   CREATE DATABASE covid_19_test; # create the test database
   \l # list all databases; confirm that covid_19_test exists
   \q # exit postgres shell
   ```
1. Run the tests: `yarn test`

## Resources

- [NY Times Covid-19 Data](https://github.com/nytimes/covid-19-data)
