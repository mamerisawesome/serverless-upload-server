'use strict'

const Zip = new require('node-zip')()
const Bluebird = require("bluebird")
const Jimp = require("jimp")

Jimp.prototype.getBufferAsync = Bluebird.promisify(Jimp.prototype.getBuffer)

class Image {
    constructor (url) {
        this.url = url
    }

    pushZip (container, image, dimension, size) {
        container.push(image.resize(dimension.x, dimension.y).getBufferAsync(Jimp.AUTO).then(data => {
            return new Bluebird((resolve, reject) => {
                resolve({size, data})
            })
        }))
    }

    generate (context, callback) {
        console.log(this.url)
        Jimp.read(this.url).then(image => {
            console.log(image)
            if (!image) return callback(null, {statusCode: 500, body: 'Buffer read empty'})
            else {
                let images = []

                this.pushZip(images, image, {x: 196, y: 196}, 'xxxhdpi')
                this.pushZip(images, image, {x: 144, y: 144}, 'xxhdpi')
                this.pushZip(images, image, {x: 96,  y: 96},  'xhdpi')
                this.pushZip(images, image, {x: 72,  y: 72},  'hdpi')
                this.pushZip(images, image, {x: 48,  y: 48},  'mdpi')

                Bluebird.all(images).then(data => {
                    for(let i = 0; i < data.length; i++) {
                        Zip.file(data[i].size + "/icon.png", data[i].data)
                    }

                    let zipfile = Zip.generate({ base64: true, compression: "DEFLATE" })
                    let response = {
                        statusCode: 200,
                        headers: {
                            "Content-Type": "application/zip",
                            "Content-Disposition": "attachment; filename=android.zip"
                        },
                        body: zipfile,
                        isBase64Encoded: true
                    }

                    return callback(null, response)
                })

                return callback(null, {statusCode: 500, body: 'No processing'})
            }
        }).catch(error => {
            return callback(error, null)
        })
    }
}

module.exports = Image
