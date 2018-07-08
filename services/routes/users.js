const User = require('../../lib/schemas/User');
const bcrypt = require('bcrypt');
const config = require('../../config');
const url = require('url');

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

    if (!email || !password || ! firstName) return res.status(405).json({message: 'Missing field(s)'});
    if (email.length <= 5 || password.length <= 6) return res.status(405).json({message: 'Email or password is too short'});

    let hashed = bcrypt.hashSync(password, config.saltRounds);
    
    if (!hashed) return res.status(400).json({message: 'Could not hash password'})

    let userData = {
      email,
      password: hashed,
      firstName,
      lastName
    };

    User.create(userData)
    .then(user => {
      delete user.password
      res.status(200).json({message: 'Created user successfully', user})
    })
    .catch(err => {
      res.status(400).json({message: 'Could not save user'})
    })
  })
};