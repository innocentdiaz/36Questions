const User = require('../schemas/User');
const helpers = require('../helpers');

module.exports = (io) => {
  var runningLoop = false;
  var userPool = {}; // Where all of the users waiting to be matched are stored!

  function randomId() {
    var t = "";
    var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 10; i++) {
      t += p.charAt(Math.floor(Math.random() * p.length));
    }
    return t;
  }

  const matchingLoop = () => { // This is the main loop
    runningLoop = true;
    let oldIDs = Object.values(userPool).map(s => s.id);
    
    for (let id in userPool) {
      let U1 = userPool[id];
      let U2 = matchIndividual(U1);
      
      if (U2) {
        removeFromMatchQue(id);
        removeFromMatchQue(U2.id);
        initRoom(U1, U2);
      }

      if (Object.keys(userPool).length < 2) { // Not enough users to match left, stop looping
        break
      }
    }

    let newIDs = Object.values(userPool).map(s => s.id);

    if (Object.keys(userPool).length >= 2 && !helpers.areEqual(oldIDs, newIDs)) { // We still have users to try to match that are not the same as the past users
      matchingLoop()
    } else {
      runningLoop = false
    }
  };

  let matchIndividual = U1 => {
    let cleanQue = Object.values(userPool).filter(socket => socket.id != U1.id) // We dont want to match the user with himself!

    for (let i = 0; i < cleanQue.length; i++) { // check if any users are matches
      let U2 = cleanQue[i];
      let U1gender = U1.userData.gender;
      let U1interests = U1.userData.interests;
      let U2gender = U2.userData.gender;
      let U2interests = U2.userData.interests;

      if (U1interests.includes(U2gender) && U2interests.includes(U1gender)) {
        return U2 // this is your partner!
      }
    }

    return null // tough luck!
  };

  const removeFromMatchQue = (socket_id) => {
    delete userPool[socket_id]
  }

  const initRoom = (U1, U2) => {
    let roomID = randomId();
    U1.emit('match success', {name: U2.userData.firstName, roomID});
    U2.emit('match success', {name: U1.userData.firstName, roomID});
  }

  var nsp = io.of('/api/matching');

  nsp.on('connection', function(socket) {
    socket.on('subscribeToQue', async (token) => {
      let decoded = helpers.verifyToken(token);
      if (!decoded) {
        return socket.emit('invalid information', 'Invalid token given')
      }
      let user = await User.findById(decoded.id, 'firstName interests gender');

      if (!user) {
        return socket.emit('invalid information', 'Invalid token provided')
      }

      let { firstName, interests, gender } = user;

      if (typeof firstName != 'string') {
        return socket.emit('invalid information', 'Invalid first name provided')
      }
      if (!Array.isArray(interests)) {
        return socket.emit('Invalid interests provided')
      }
      if (typeof gender != 'string') {
        return socket.emit('invalid information', 'Invalid gender provided')
      }

      let socketId = socket.id;

      userPool[socketId] = socket
        
      userPool[socketId].userData = {
        firstName,
        interests,
        gender
      };

      socket.emit('subscribe success');
      let queLength = Object.keys(userPool).length
      nsp.emit('que length', queLength);

      if (queLength >= 2 && !runningLoop) {
        matchingLoop()
      }
    });
    socket.on('disconnect', function() {
      removeFromMatchQue(socket.id);
      nsp.emit('que length', Object.keys(userPool).length);
    });
  });
}