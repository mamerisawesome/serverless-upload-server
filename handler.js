'use strict'

/**
 * @description project init functions for testing purposes
 */
module.exports.hello = (event, context, callback) => {
    const response = {
        foo: 'bar',
        awe: process.env.AWESOME_VAR,
        secret: process.env.SECRET_VAR,
    }

    callback(null, response)
}

/**
 * @description http methods
 * @todo make this work for single file referencing
 */
module.exports.todos_http = {
    post    : require('./todos/create'),
    del     : require('./todos/delete'),
    get     : require('./todos/get'),
    get_all : require('./todos/list'),
    put     : require('./todos/update'),
}
