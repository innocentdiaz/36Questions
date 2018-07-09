const User = require('../../lib/schemas/User');
const bcrypt = require('bcrypt');
const config = require('../../config');
const url = require('url');
const jwt = require('jsonwebtoken');

module.exports = (app) => {
  app.get('/api/users', function(req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    let id = query.id;

    User.findOne({_id: id})
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

    if (!email || !password || ! firstName) return res.status(405).json({message: 'Missing field(s)'});
    if (email.length <= 5 || password.length <= 6) return res.status(405).json({message: 'Email or password is too short'});

    let hashed = bcrypt.hashSync(password, config.saltRounds);
    
    if (!hashed) return res.status(400).json({message: 'Could not hash password'})

    let userData = {
      email,
      password: hashed,
      firstName,
      lastName,
      interests,
      gender
    };

    User.create(userData, function(err, user) {
      if (err) return res.status(400).json({message: 'Could not save user'});
      let token = jwt.sign({user}, config.JWTkey, {expiresIn: 86400 /* expires in 24 hours*/});

      res.status(200).json({message: 'Created user successfully', user, token})
    });
  })
};