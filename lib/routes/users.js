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

  app.post('/api/users', upload.any(), async (req, res) => {
    const email = req.body.email ? req.body.email : false;
    const password = req.body.password ? req.body.password : false;
    const firstName = req.body.firstName ? req.body.firstName : false;
    const lastName = req.body.lastName ? req.body.lastName : '';
    const interests = !isNaN(req.body.interests) && req.body.interests >= 0 && req.body.interests <= 2 ? Number(req.body.interests) : false;
    const gender = !isNaN(req.body.gender) && req.body.gender >= 0 && req.body.gender <= 1 ? Number(req.body.gender) : false;
    const bio = req.body.bio ? req.body.bio : '';
    const profilePicture = typeof(req.files) == 'object' && typeof req.files[0] == 'object' ? req.files[0] : {};

    if (!email || !password || !firstName || isNaN(interests)) return res.status(422).json({message: 'Missing field(s)'});
    if (email.length <= 5) return res.status(422).json({message: 'Email is too short'});
    if (password.length < 8) return res.status(422).json({message: 'Password must be atleast 8 characters long'});
    if (bio.length > 500) return res.status(422).json({message: 'Bio is too long! (500 characters max)'});
    if (profilePicture.fileSize > 2.8e+7) { // 28 MB
      return res.status(422).json({ message: 'Please select an image below 28MB' });
    }

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

    // Create this user
    let user = new User(userData);

    try {
      await user.save()
    } catch(error) {
      return res.status(400).json({ message: 'Could not create account. It probably already exists' });
    }
    let token = helpers.signToken({ id: user._id }, { expiresIn: 86400 });

    if (profilePicture.fieldname == 'profilePicture' && profilePicture.buffer) {
      user = await attemptPutProfilePicture({ user, profilePicture });
    }
    res.status(200).json({ message: 'Created user successfully', user, token });
  });
};

const attemptPutProfilePicture = async ({ user, profilePicture }) => {
  if (!user || !profilePicture) {
    throw 'USER or PROFILEPICTURE MISSING INSIDE OF attemptPutProfilePicture'
  }

  try {
    let data = await s3.upload({
      Bucket: 'thirty-six-questions',
      ContentType: profilePicture.mimetype,
      Key: `profile-picture/${user.id}`,
      Body: profilePicture.buffer
    }).promise();
    if (data) {
      user.profilePictureUrl = data.Location
      await user.save()
    }
  } finally {
    return user
  }
}