'use strict'

module.exports.hello = (event, context, callback) => {
    const response = {
        foo: 'bar',
        awe: process.env.AWESOME_VAR,
        secret: process.env.SECRET_VAR,
    }

    callback(null, response)
}
