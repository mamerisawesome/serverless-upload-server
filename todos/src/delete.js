'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const DB = require('./../db/models')
const Todo = DB.Todo

module.exports.delete = (event, context, callback) => {
  const data = JSON.parse(event.body)

  Todo.destroy({
    where: {'id': data.id}
  }).then(result => {
    const response = {
      statusCode: 200,
      body: JSON.stringify(result),
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
    process.exit(1)
  })
}
