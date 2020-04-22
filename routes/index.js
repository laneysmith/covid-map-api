const express = require('express');
const fetch = require('node-fetch');

const db = require('../db/api');
const transformData = require('../utils/transformData');

const router = express.Router();
const RAW_COUNTY_DATA_URL =
  'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';

router.get('/', async (request, response, next) => {
  // Get current record (if exists) from database
  const currentRecord = await db.getCurrentRecord();
  const currentEtag = currentRecord ? currentRecord.etag : null;
  console.info('currentEtag:', currentEtag);

  // Make conditional request to data source with etag
  const nytDataResponse = await fetch(RAW_COUNTY_DATA_URL, {
    headers: { 'If-None-Match': currentEtag },
  });
  const responseStatus = await nytDataResponse.status;
  console.info('responseStatus:', responseStatus);

  if (responseStatus === 304) {
    // Not modified; return data from current record
    console.info('No changes to data, returning current data.');
    response.json(currentRecord.data);
  } else if (responseStatus === 200) {
    // Data has been modified; extract, transform, and update record
    console.info('Extracting & transforming new data...');
    const newEtag = nytDataResponse.headers.get('etag');
    const responseText = await nytDataResponse.text();
    const transformedData = await transformData(responseText);
    console.info('newEtag:', newEtag);

    // Add/update new data in db
    await db.upsertRecord({ currentEtag, newData: transformedData, newEtag });
    response.json(transformedData);
  } else if (currentEtag) {
    console.info('Error retrieving new data, returning old data instead.');
    response.json(currentRecord.data);
  } else {
    const errorObj = new Error('Failed to retrieve Covid-19 data.');
    errorObj.statusCode = 500;
    next(errorObj);
  }
});

module.exports = router;
