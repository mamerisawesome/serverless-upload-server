'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: process.env.DYNAMODB_TABLE,
};

module.exports.list = (event, context, callback) => {
  Todo.findAll().then(todos => {
    const response = {
      statusCode: 200,
      body: JSON.stringify(todos),
    };

    callback(null, response);
    process.exit(0);
  }).catch(err => {
    console.error(err);
    callback(null, {
      statusCode: err.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t fetch the todo item.',
    });
    return;
  });
};
