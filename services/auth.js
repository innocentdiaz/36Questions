const jwt = require('jsonwebtoken');
const config = require('../config');
const url = require('url');

module.exports = (app) => {
  app.get('/api/auth', (req, res) => {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    let token = query.token;

    if (!token) return res.status(405).json({message: 'Missing token'})
    try {
      const decoded = jwt.verify(token, config.JWTkey);
      res.status(decoded ? 200 : 406).json(decoded ? {decoded} : {message: 'Failed auth'})
    } catch (error) {
      res.status(400).json({message: 'Failed decode'})
    }
    
  });
  app.post('/api/auth', (req, res) => {
    let email = req.body.email ? req.body.email : false;
    let password = req.body.password ? req.body.password: false;

    if (!email || !password) res.status(405).json({message: 'Missing field(s)'});

    var token = jwt.sign({email, password, expiresIn: 1000 * 60 * 60 * 24}, config.JWTkey);
    res.status(200).json({token});
  });
}