'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const DB = require('./../db/models')
const Todo = DB.Todo

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime()
  const data = JSON.parse(event.body)

  data.updatedAt = timestamp

  if (typeof data.text !== 'string' || typeof data.checked !== 'boolean') {
    console.error('Validation Failed')
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the todo item.',
    })
    return
  }

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {id: event.pathParameters.id}
  }

  Todo.update(data, {
    where: {
      _id: params.Key.id
    }
  }).then(result => {
    const response = {
      statusCode: 200,
      body: JSON.stringify(result),
    }

    callback(null, response)
    process.exit(0)
  })
}
