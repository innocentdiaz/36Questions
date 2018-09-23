const User = require('../../lib/schemas/User');
const helpers = require('../helpers');

module.exports = (app) => {
  app.get('/api/users/:id', function(req, res) {
    let id = req.params.id

    if (!id) return res.status(422).json({ message: 'No id provided' })

    User.findById(id)
    .select('firstName lastName')
    .then(user => {
      res.status(200).json(user)
    })
    .catch(err => {
      res.status(404).json({message: 'Could not find user'})
    })
  });

  app.post('/api/users', function(req, res) {
    const email = req.body.email ? req.body.email : false;
    const password = req.body.password ? req.body.password : false;
    const firstName = req.body.firstName ? req.body.firstName : false;
    const lastName = req.body.lastName ? req.body.lastName : '';
    const interests = typeof (req.body.interests == Array) ? req.body.interests : false;
    const gender = req.body.gender ? req.body.gender : false; 
    const bio = req.body.bio ? req.body.bio : '';

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

    User.create(userData, function(err, user) {
      if (err) return res.status(400).json({message: 'Could not create user.. Probably already exists'});
      let token = helpers.signToken({id: user._id}, {expiresIn: 86400 /* expires in 24 hours*/});

      res.status(200).json({message: 'Created user successfully', user, token})
    });
  })
};