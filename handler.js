import fetch from "node-fetch"
import GM from 'gm'
import AWS from 'aws-sdk'

const gm = GM.subClass({ imageMagick: true });
const bucket = new AWS.S3({
  params: { Bucket: 'thumbnailerthumbs' }
})

export const resize = (event, context, cb) => {
  const url = decodeURIComponent(event.pathParameters.imageUrl)
  const query = event.queryStringParameters || {}
  const height = parseInt(query.height) || null
  const width = parseInt(query.width) || null
  const crop = ['cover', 'contain'].indexOf(query.crop) === -1 ? null : query.crop
  const background = ['black', 'white'].indexOf(query.background) === -1 ? 'white' : query.background
  const rotate = [90, 180, 270].indexOf(parseInt(query.rotate)) === -1 ? null : parseInt(query.rotate)
  const blur = parseFloat(query.blur) ? (Math.max(Math.min(1, parseFloat(query.blur)), 0) * 10) : null
  const quality = parseInt(query.quality) ? (Math.max(Math.min(100, parseInt(query.quality)), 0)) : null

  const shouldCrop = height && width

  fetch(url)
    .then((ret) => ret.buffer())
    .then((buffer) => gm(buffer).gravity("Center"))
    .then((image) => rotate ? image.rotate(background, rotate) : image)
    .then((image) => image.resize(width, (shouldCrop && crop === "cover") ? height + "^" : height))
    .then((image) => (shouldCrop && crop) ? image.extent(width, height) : image)
    .then((image) => background ? image.flatten().fill(background).background(background) : image)
    .then((image) => blur ? image.blur(5 * blur, 5 * blur) : image)
    .then((image) => quality ? image.quality(quality) : image)
    // .then((image) => image.makeWatermark())
    .then((gmObject) => {
      return new Promise((res, rej) => {
        gmObject.toBuffer("jpeg", (err, buffer) => err ? rej(err) : res(buffer))
      })
    })
    .then((buffer) => cb(null, {statusCode: 200, body: buffer.toString('base64'), isBase64Encoded: true, headers: {"Content-Type": "application/octet-stream"}}))
}

gm.prototype.makeWatermark = function() {
  return this.gravity('SouthEast')
    .out('(', './assets/anvil_1x.png', ' ', '-resize', '32x32^', ')')
    .out('-composite');
}

export const tile = (event, context, cb) => {
  const url = decodeURIComponent(event.pathParameters.imageUrl)
}

function pluck(keys, obj) {
  return keys.reduce((acc, key) => {
    acc[key.toLowerCase()] = obj[key]
    return acc
  }, {})
}

export const meta = (event, context, cb) => {
  const url = decodeURIComponent(event.pathParameters.imageUrl)

  fetch(url)
    .then((ret) => ret.buffer())
    .then((buffer) => new Promise((res, rej) => gm(buffer).identify((err, val) => err ? rej(err) : res(pluck(['size', 'Filesize'], val)))))
    .then((data) => {console.log(data); return data})
    .then((data) => cb(null, {headers: {"Content-Type": "application/json"}, body: JSON.stringify(data), statusCode: 200}))
    // .then((data) => cb(null, data))
    // .catch((err) => cb(err))
}
