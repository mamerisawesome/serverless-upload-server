'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const DB = require('./../db/models');
const Todo = DB.Todo;

module.exports.create = (event, context, callback) => {
  const data = JSON.parse(event.body);
  if (typeof data.text !== 'string') {
    console.error('Validation Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t create the todo item.',
    });
    return;
  }

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      text: data.text,
      checked: false
    },
  };

  const response = {
    statusCode: 200,
    body: JSON.stringify(params.Item),
  };

  // write the todo to the database
  Todo.sync({force: false}).then(() => {
    return Todo.create(params.Item)
  }).then(todo => {
    callback(null, {status: response.statusCode, todo});
    process.exit(0);
  });
};
