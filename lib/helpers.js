const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWTKey = process.env.JWTKey;
if (!JWTKey) {
  throw "MISSING JWTKey enviromental variable"
}
const saltRounds = Number(process.env.saltRounds);
if (!saltRounds) {
  throw "MISSING saltRounds enviromental variable"
}

const helpers = {};

helpers.hashSync = (password) => {
  return bcrypt.hashSync(password, saltRounds)
}
helpers.verifyToken = token => {
  try {
    decoded = jwt.verify(token, JWTKey);
    return decoded
  } catch (e) {
    return null
  }
}
helpers.signToken = (obj, exp) => {
  let signed = jwt.sign(obj, JWTKey, exp);
  return signed
}
helpers.areEqual = (value, other) => {
  // helps compare arrays
  return JSON.stringify(value) === JSON.stringify(other);
}
module.exports = helpers