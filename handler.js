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
        let s3 = new AWS.S3()
        let params = parser.parseResponse(event.body)
        let headers = params.headers['Content-Disposition']
        let filename = headers.split("filename=\"")[headers.split("filename=\"").length-1].split("\"")[0]
        let content_type = 'image/' + filename.split('.')[filename.split('.').length-1]

        let s3Params = {
            Bucket: 'smartspark',
            Key:  'files/' + filename,
            ContentType: content_type,
            ACL: 'public-read',
        }

        let uploadURL = s3.getSignedUrl('putObject', s3Params)
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
