const Zip = new require('node-zip')()
const Bluebird = require("bluebird")
const Jimp = require("jimp")

Jimp.prototype.getBufferAsync = Bluebird.promisify(Jimp.prototype.getBuffer)

class Image {
    constructor (url) {
        this.url = url
    }

    pushZip (container, dimension, size) {
        container.push(image.resize(dimension.x, dimension.y).getBufferAsync(Jimp.AUTO).then(data => {
            return new Bluebird((resolve, reject) => {
                resolve({size, data})
            })
        }))
    }

    generate (callback) {
        Jimp.read(this.url, (error, image) => {
            if(error) return callback(error, null)

            let images = []

            this.pushZip(images, {x: 196, y: 196}, 'xxxhdpi')
            this.pushZip(images, {x: 144, y: 144}, 'xxhdpi')
            this.pushZip(images, {x: 96,  y: 96},  'xhdpi')
            this.pushZip(images, {x: 72,  y: 72},  'hdpi')
            this.pushZip(images, {x: 48,  y: 48},  'mdpi')

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

                callback(null, response)
            })
        })
    }
}

module.exports = Image
