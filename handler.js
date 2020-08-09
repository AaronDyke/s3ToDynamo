"use strict";
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

module.exports.s3ToDynamo = async (event) => {
  // console.log('event is', JSON.stringify(event));

  const Bucket = event.Records[0].s3.bucket.name;
  const Key = event.Records[0].s3.object.key;

  const data = await s3.getObject({ Bucket, Key }).promise();
  let rawText = data.Body.toString("ascii");

  let parsedData = parseData(Key, rawText);

  return { message: 'Successfully uploaded to dynamo' };
};

/**
 * Parse raw text and return an array of JSON objects
 */
function parseData(key, rawText) {
  let parsedData;
  if (key.endsWith(".csv")) {
    console.log("Csv file detected");
    parsedData = csvToJson(rawText);
    // let lines = rawText.split('\n');
    // parsedData = lines.map(line => { return line.split(',') });
  } else if (key.endsWith(".json")) {
    console.log("Json file detected");
    parsedData = JSON.parse(rawText);
  } else {
    console.error("Unsupported file type");
    throw "Unsupported file type";
  }
  return parsedData;
}

function csvToJson(rawCsvText) {
  let lines = rawCsvText.split("\n");

  let csvAsJson = [];
  let headers = lines[0].split(",");

  for (var i = 1; i < lines.length; i++) {
    let lineAsObject = {};
    let currentLine = lines[i].split(",");

    for (let j = 0; j < headers.length; j++) {
      lineAsObject[headers[j]] = currentLine[j];
    }

    csvAsJson.push(lineAsObject);
  }

  return csvAsJson;
}
