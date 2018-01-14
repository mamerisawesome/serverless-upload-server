'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const DB = require('./../db/models')
const Todo = DB.Todo

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime()
  const data = JSON.parse(event.body)

  data.updatedAt = timestamp

  Todo.update(data, {
    where: {id: data.id}
  }).then(result => {
    const response = {
      statusCode: 200,
      body: JSON.stringify(result),
    }

    return callback(null, response)
  })
}
