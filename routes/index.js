const express = require('express');
const fetch = require('node-fetch');
const { get } = require('lodash/object');

const db = require('../db/api');
const transformData = require('../utils/transformData');

const router = express.Router();
const RAW_COUNTY_DATA_URL =
  'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';

router.get('/', async (request, response, next) => {
  // Get current record (if exists) from database
  const currentRecord = await db.getCurrentRecord();
  const currentEtag = get(currentRecord, 'etag', null);
  const currentData = get(currentRecord, 'data', null);
  const lastFetchedTimestamp = get(currentRecord, 'last_fetched_timestamp', null);

  if (currentRecord) {
    // If less than 3 hrs have passed since we last fetched data, return current data
    const threeHoursAgo = new Date(Date.now());
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
    if (lastFetchedTimestamp > threeHoursAgo) {
      console.info('Less than 3 hours since last fetch, returning current data.');
      response.json(currentData);
      return;
    }
  }

  // Make conditional request to data source with etag
  const nytDataResponse = await fetch(RAW_COUNTY_DATA_URL, {
    headers: { 'If-None-Match': currentEtag },
  });
  const responseStatus = await nytDataResponse.status;

  if (responseStatus === 304) {
    // Not modified; return data from current record
    console.info('No changes to data, returning current data.');
    response.json(currentData);
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
    response.json(currentData);
  } else {
    const errorObj = new Error('Failed to retrieve Covid-19 data.');
    errorObj.statusCode = 500;
    next(errorObj);
  }
});

module.exports = router;
