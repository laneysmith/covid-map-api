const csv = require('csvtojson');

const {
  NEW_YORK_CITY,
  BRONX_COUNTY,
  KINGS_COUNTY,
  NEW_YORK_COUNTY,
  QUEENS_COUNTY,
  RICHMOND_COUNTY,
} = require('../constants');

const transformData = async (csvText) => {
  const transformedData = {
    data: {},
    maxCases: 0,
    maxDeaths: 0,
  };
  const jsonArray = await csv().fromString(csvText);

  jsonArray.forEach((row) => {
    const { date, county, state, fips, cases, deaths } = row;

    if (!fips && county !== NEW_YORK_CITY) {
      // Strip out rows without a FIPS code, as they can't be mapped 1:1 with a county
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(transformedData.data, date)) {
      transformedData.data[date] = {};
    }

    const casesInt = parseInt(cases, 10);
    const deathsInt = parseInt(deaths, 10);

    if (casesInt > transformedData.maxCases) {
      transformedData.maxCases = casesInt;
    }

    if (deathsInt > transformedData.maxDeaths) {
      transformedData.maxDeaths = deathsInt;
    }

    // Handle geographic exception for New York City
    // TODO: figure out how to handle the other exceptions
    // https://github.com/nytimes/covid-19-data#geographic-exceptions
    if (county === 'New York City') {
      const aggregate = { cases: casesInt, deaths: deathsInt };
      transformedData.data[date][BRONX_COUNTY] = aggregate;
      transformedData.data[date][KINGS_COUNTY] = aggregate;
      transformedData.data[date][NEW_YORK_COUNTY] = aggregate;
      transformedData.data[date][QUEENS_COUNTY] = aggregate;
      transformedData.data[date][RICHMOND_COUNTY] = aggregate;
    } else {
      transformedData.data[date][fips] = { cases: casesInt, deaths: deathsInt };
    }
  });

  return transformedData;
};

module.exports = transformData;
