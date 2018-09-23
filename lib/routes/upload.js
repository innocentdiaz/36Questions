const uuid = require('uuid/v1');
const AWS = require('aws-sdk');
const helpers = require('../helpers');
const User = require('../schemas/User');

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
  app.get('/api/upload/:token', async (req, res) => {
    let token = typeof req.params.token == 'string' ? req.params.token : false

    if (!token) return res.status(422).json({ message: 'Invalid token provided' })

    let decoded = helpers.verifyToken(token);

    if (!decoded) return res.status(401).json({ message: 'Invalid token provided' });

    user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    let key = `${user.id}/${uuid()}`

    s3.getSignedUrl('putObject', {
      Bucket: 'thirty-six-questions',
      Key: key,
      ContentType: 'image/*'
    }, (err, url) => {
      if (err) return res.status(400).json({ message: 'Could not generate presigned url' });

      res.status(200).json({ key, url })
    });
  });
}