const uuid = require('uuid/v1');
const AWS = require('aws-sdk');

let { 
  accessKeyId,
  secretAccessKey
} = process.env;

if (!accessKeyId || !secretAccessKey) {
  throw 'Missing keys for AWS'
} else {
  console.log('AWS CONFIG: ')
  console.log('ACCESSKEYID:', accessKeyId);
  console.log('SECRETACCESSKEY:', secretAccessKey.substring(0, 3) + '....')
}

const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4',
  region: 'us-east-2'
});

module.exports = app => {
  app.get('/api/upload', (req, res) => {

  });
  app.put('/api/upload', (req, res) => {

  });
}