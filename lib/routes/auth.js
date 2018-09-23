const User = require('../../lib/schemas/User');
const bcrypt = require('bcrypt');
const helpers = require('../helpers');

module.exports = (app) => {
  app.get('/api/auth/:token', async (req, res) => {
    let token = req.params.token;

    if (!token) return res.status(422).json({message: 'Missing token'})

    let decoded = helpers.verifyToken(token);
    if (!decoded || !decoded.id) return res.status(401).json({message: 'Failed auth'});

    let user = await User.findById(decoded.id)
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404).json({ message: 'Could not find user' })
    }
  });
  app.post('/api/auth', (req, res) => {
    if (!req.body) return res.status(405).json({message: 'No fields provided'});
    let email = req.body.email ? req.body.email : false;
    let password = req.body.password ? req.body.password: false;

    if (!email || !password) return res.status(405).json({message: 'Missing field(s)'});

    User.findOne({email: {"$regex": email, "$options": "i"}})
    .then(user => {
      let comparison = bcrypt.compareSync(password, user.password);

      if (!comparison) return res.status(406).json({message: 'Failed authentication'});
      
      var token = helpers.signToken({id: user._id}, {expiresIn: 1000 * 60 * 60 * 24});
      res.status(200).json({token});
    })
    .catch(err => {
      res.status(404).json({message: 'User by this email/password combination does not exist'})
    });
  });
}