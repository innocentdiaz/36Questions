const jwt = require('jsonwebtoken');
const url = require('url');
const User = require('../../lib/schemas/User');
const bcrypt = require('bcrypt');

module.exports = (app) => {
  app.get('/api/auth', (req, res) => {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    let token = query.token;

    if (!token) return res.status(422).json({message: 'Missing token'})

    jwt.verify(token, process.env.JWTkey, (err, decoded) => {
      if (!decoded || !decoded.id || err) return res.status(401).json({message: 'Failed auth'});
      User.findById(decoded.id)
      .then(user => {
        res.status(200).json(user)
      })
      .catch(err => {
        res.status(404).json({ message: 'Could not find user' })
      })
    });
    
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
      
      var token = jwt.sign({id: user._id}, process.env.JWTkey, {expiresIn: 1000 * 60 * 60 * 24});
      res.status(200).json({token});
    })
    .catch(err => {
      console.log(err)
      res.status(404).json({message: 'Could not find user'})
    })

  });
}