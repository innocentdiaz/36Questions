const helpers = require('../helpers');

module.exports = (io) => {
  var runningLoop = false;
  var pendingMatchQue = {};

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
    let oldIDs = Object.values(pendingMatchQue).map(s => s.id);
    
    for (let id in pendingMatchQue) {
      let U1 = pendingMatchQue[id];

      let U2 = matchIndividual(U1);
      
      if (U2) {
        removeFromMatchQue(id);
        removeFromMatchQue(U2.id);
        initRoom(U1, U2);
      }

      if (Object.keys(pendingMatchQue).length < 2) { // We still have users to try to match that are not the same as the past users
        break
      }
    }

    let newIDs = Object.values(pendingMatchQue).map(s => s.id);

    if (Object.keys(pendingMatchQue).length >= 2 && !helpers.areEqual(oldIDs, newIDs)) { // We still have users to try to match that are not the same as the past users
      matchingLoop()
    } else {
      runningLoop = false
    }
  };

  let matchIndividual = U1 => {
    let cleanQue = Object.values(pendingMatchQue).filter(socket => socket.id != U1.id) // We dont want to match the user with himself!

    for (let i = 0; i < cleanQue.length; i++) { // check if any users are matches
      let U2 = cleanQue[i];
      let U1gender = U1._data.gender;
      let U1interests = U1._data.interests;
      let U2gender = U2._data.gender;
      let U2interests = U2._data.interests;

      if (U1interests.includes(U2gender) && U2interests.includes(U1gender)) {
        return U2 // this is your partner!
      }
    }

    return null // tough luck!
  };

  const removeFromMatchQue = (socket_id) => {
    delete pendingMatchQue[socket_id]
  }

  const initRoom = (U1, U2) => {
    roomName = randomId();
    U1.emit('match success', {name: U2._data.firstName, roomName});
    U2.emit('match success', {name: U1._data.firstName, roomName});
  }

  var nsp = io.of('/api/matching');

  nsp.on('connection', function(socket) {
    socket.on('subscribeToQue', (data) => {
      let {firstName, interests, gender} = data;
      
      if (!firstName || !Array.isArray(interests) || !gender) return socket.emit('invalid information')

      pendingMatchQue[socket.id] = socket
        
      pendingMatchQue[socket.id]._data = {
        firstName,
        interests: interests.filter(interest=>interest.toLowerCase()),
        gender: gender.toLowerCase()
      };

      nsp.emit('que length', Object.keys(pendingMatchQue).length);
      socket.emit('subscribe success', String(Object.keys(pendingMatchQue).length));

      if (Object.keys(pendingMatchQue).length >= 2 && !runningLoop) {
        matchingLoop()
      }
    });
    socket.on('disconnect', function() {
      removeFromMatchQue(socket.id);
      nsp.emit('que length', Object.keys(pendingMatchQue).length);
    });
  });
}