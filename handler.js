'use strict'

module.exports.hello = (event, context, callback) => {
    const response = {
        foo: 'bar',
        awe: process.env.AWESOME_VAR,
        secret: process.env.SECRET_VAR,
    }

    callback(null, response)
}

const Image = require("./todos/helpers/image");

module.exports.generate = (event, context, callback) => {
    var i = new Image(Buffer.from(event.body, "base64"));
    i.generate(callback);
};
