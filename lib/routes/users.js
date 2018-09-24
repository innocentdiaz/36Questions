const User = require('../../lib/schemas/User');
const AWS = require('aws-sdk');
const helpers = require('../helpers');
var multer  = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

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
  region: 'us-east-1'
});

module.exports = (app) => {
  app.get('/api/users/:id', (req, res) => {
    let id = req.params.id

    if (!id) return res.status(422).json({ message: 'No id provided' })

    User.findById(id)
    .select('firstName lastName profilePictureUrl')
    .then(user => {
      res.status(200).json(user)
    })
    .catch(err => {
      res.status(404).json({message: 'Could not find user'})
    })
  });

  app.post('/api/users', upload.single('profilePicture'), async (req, res) => {
    const email = req.body.email ? req.body.email : false;
    const password = req.body.password ? req.body.password : false;
    const firstName = req.body.firstName ? req.body.firstName : false;
    const lastName = req.body.lastName ? req.body.lastName : '';
    const interests = typeof (req.body.interests == Array) ? req.body.interests : false;
    const gender = req.body.gender ? req.body.gender : false; 
    const bio = req.body.bio ? req.body.bio : '';
    let profilePicture = typeof(req.file) == 'object' && req.file.fieldname === 'profilePicture' ? req.file : false;

    if (!email || !password || ! firstName) return res.status(405).json({message: 'Missing field(s)'});
    if (email.length <= 5 || password.length <= 6) return res.status(405).json({message: 'Email or password is too short'});

    let hashed = helpers.hashSync(password);
    
    if (!hashed) return res.status(400).json({message: 'Could not hash password'})

    let userData = {
      email,
      password: hashed,
      firstName,
      lastName,
      interests,
      gender,
      bio
    };

    // Create the user
    let user = new User(userData)

    if (profilePicture && profilePicture.buffer) {
      if (profilePicture.fileSize > 2.8e+7) {
        return res.status(422).json({ message: 'Please select an image below 28MB' });
      } // 28 MB
      let key = `profile-picture/${user.id}`

      let data = await s3.upload({
        Bucket: 'thirty-six-questions',
        ContentType: profilePicture.mimetype,
        Key: key,
        Body: profilePicture.buffer
      }).promise();

      if (data) {
        user.profilePictureUrl = data.Location
      }
    }

    user.save((err) => {
      if (err) return res.status(400).json({ message: 'Could not create user.. Probably already exists' });
  
      
      let token = helpers.signToken({ id: user._id }, { expiresIn: 86400 /* expires in 24 hours*/ });
      res.status(200).json({message: 'Created user successfully', user, token});
    });
  });
};