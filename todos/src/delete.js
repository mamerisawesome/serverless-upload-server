'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const DB = require('./../db/models')
const Todo = DB.Todo

module.exports.delete = (event, context, callback) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      id: event.pathParameters.id,
    },
  }

  Todo.destroy({where: {'id': params.Key.id}}).then(todo => {
    const response = {
      statusCode: 200,
      body: JSON.stringify(todo),
    }

    callback(null, response)
    process.exit(0)
  }).catch(err => {
    console.error(err)
    callback(null, {
      statusCode: err.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t fetch the todo item.',
    })
    return
  })
}
