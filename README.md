# Serverless framework S3 to DynamoDb

This repository contains a serverless framework project which creates an s3 bucket, lambda function, and DynamoDB table. When files (currently supporting json and csv) are uploaded to the s3 bucket a lambda function triggers which populates the DynamoDB table with the provided data.

## How do I run this?
1. Make sure you have installed and configured the serverless framework. [Need help?](https://www.serverless.com/framework/docs/providers/aws/guide/installation/)
2. Clone this repo!
3. Open the cloned repo in your terminal and favorite text editor.
4. Change the `bucketName` in the serverless.yml custom properties
5. (Optional) change the `dynamoDBTableName` in the serverless.yml custom properties. 
6. run `sls deploy`
7. Once everything has been deployed you need to add the `/calls` and `/clients` folders into your dynamodb table to notify the lambda correctly.
8. Upload the mock data (or go wild and create your own).
9. Check the DynamoDB table and enjoy your data being stored.

## What is this mock data?
This mock data is there to represent a call center where clients can call and get answers to their car questions. The client data is identification information about the client. The call data is a log of calls that a client has with an agent and what car they are calling about. When uploaded into DynamoDB I used a single table multiple entity table design. This design allows a user to query the table to retrieve all calls a user has had with the service as well as individual calls. With the use of  global secondary indexes one could find all the calls a agent has with a client or all the calls an agent has taken.