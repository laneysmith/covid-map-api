const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const db = require('../db/api');
const transformData = require('../utils/transformData');

const router = express.Router();
const RAW_COUNTY_DATA_URL =
  'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';

router.get('/', async (request, response, next) => {
  const currentRecord = await db.getCurrentRecord();
  const currentEtag = currentRecord ? currentRecord.etag : null;
  console.log('currentEtag :', currentEtag);

  const nytDataResponse = await fetch(RAW_COUNTY_DATA_URL, {
    headers: { 'If-None-Match': currentEtag },
  });

  const responseStatus = await nytDataResponse.status;
  console.log('responseStatus :', responseStatus);

  if (responseStatus === 304) {
    console.log('No changes to data, returning current data.');
    response.json(currentRecord.data);
  } else if (responseStatus === 200) {
    console.log('Retrieving new data...');
    const newEtag = nytDataResponse.headers.get('etag');
    const responseText = await nytDataResponse.text();
    const transformedData = await transformData(responseText);
    console.log('newEtag :', newEtag);

    if (currentRecord === undefined) {
      console.log('Creating new record...');
      await db.createDataAndEtagRecord(transformedData, newEtag);
      response.json(transformedData);
    } else {
      console.log('Updating record...');
      await db.updateDataAndEtagRecord(transformedData, newEtag);
      response.json(transformedData);
    }
  } else if (currentRecord.data) {
    console.log('Error retrieving new data, returning old data instead.');
    response.json(currentRecord.data);
  } else {
    const errorObj = new Error('Failed to retrieve Covid-19 data.');
    errorObj.statusCode = 500;
    next(errorObj);
  }
});

module.exports = router;
