'use strict'

let AWS = require('aws-sdk')
let parser = require('http-string-parser')

module.exports.requestUploadUrl = (event, context, callback) => {
    if (!event || event && !event.body) {
        return callback(null, {
            statusCode: 501,
            headers: {
                "Access-Control-Allow-Origin" : "*",
                "Access-Control-Allow-Credentials" : true
            },
            body: JSON.stringify({ "message": "Missing file" })
        })
    } else {
        const S3 = new AWS.S3({
            s3ForcePathStyle: true,
            endpoint: new AWS.Endpoint('http://localhost:3030'),
        })

        let params = parser.parseResponse(event.body)
        let headers = params.headers['Content-Disposition']
        let filename = JSON.parse(event.body).name
        let content_type = JSON.parse(event.body).type

        console.log(event.body)
        let s3Params = {
            Bucket: 'local-bucket',
            Key:  'uploads/' + filename,
            ContentType: content_type,
            ACL: 'public-read',
        }

        let uploadURL = S3.getSignedUrl('putObject', s3Params)
        callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({uploadURL}),
        })
    }
}

module.exports.afterSend = (event, context, callback) => {
    console.log(event.Records)
    event.Records.forEach(record => {
        const f = {
            name: record.s3.object.key,
            size: record.s3.object.size
        }

        callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                file: record.s3.object,
                message: `Image created: `+f.name+` (`+f.size+` bytes)`
            })
        })
    })
}
