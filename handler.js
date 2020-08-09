"use strict";
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const TABLE = process.env.TABLE || '';

module.exports.s3ToDynamo = async (event) => {
  // console.log('event is', JSON.stringify(event));
  if(!TABLE) {
    throw "DynamoDB table environment variable not configured";
  }

  const Bucket = event.Records[0].s3.bucket.name;
  const Key = event.Records[0].s3.object.key;

  const data = await s3.getObject({ Bucket, Key }).promise();
  let rawText = data.Body.toString("ascii");

  let parsedData = parseData(Key, rawText);
  let dynamoDbBatchWriteParams = createDynamoDbBatchWrites(parsedData);
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

function createDynamoDbBatchWrites(objects){
  let requestItems = objects.map(object => {
    let keys = createDynamoDbKeys(object);
    return {
      PutRequest: {
        ...keys,
        ...object
      }
    }
  })
  
  // chunk into size 25 to fit dynamodb requirements for batchWrite 
  let chunkedRequests = chunkArray(requestItems, 25);

  // creating array of dynamodb batchWrite params
  let params = chunkedRequests.map(chunkedRequest => {
    let RequestItems = {};
    RequestItems[TABLE] = chunkedRequest;
    return { RequestItems }
  })

  return params;
}

function chunkArray(array, chunkSize) {
  let arrayOfChunks = [];
  for (let i=0; i<array.length; i+=chunkSize){
    arrayOfChunks.push(array.slice(i,i+chunkSize));
  }
  return arrayOfChunks;
}

function createDynamoDbKeys(object) {
  return { 'PK': object['id'], 'SK': object['email']};
}
