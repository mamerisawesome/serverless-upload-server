'use strict'

module.exports.hello = (event, context, callback) => {
    const response = {foo: 'bar'}

    callback(null, response)
}

const Image = require("./todos/helpers/image");

module.exports.generate = (event, context, callback) => {
    if (!event || event && !event.body) return callback(null, {"statusCode": 500, "body": "No file input"})
    else {
        var i = Buffer.from(event.body, "base64")
        i.generate(context, callback)
    }
}
