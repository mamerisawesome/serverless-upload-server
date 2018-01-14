'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const DB = require('./../db/models')
const Todo = DB.Todo

const params = {
  TableName: process.env.TABLE_NAME,
}

module.exports.list = (event, context, callback) => {
  Todo.findAll().then(todos => {
    const response = {
      statusCode: 200,
      body: JSON.stringify(todos),
    }

    return callback(null, response)
  }).catch(err => {
    console.error(err)
    return callback(null, {
      statusCode: err.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t fetch the todo item.',
    })
  })
}
