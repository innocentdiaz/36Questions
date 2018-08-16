module.exports = (io) => {
  var pendingMatchQue = {};
  var loopIsRunning = false;
  function randomId() {
    var t = "";
    var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 10; i++) {
      t += p.charAt(Math.floor(Math.random() * p.length));
    }
    return t;
  }

  const matchingLoop = () => { // This is the main loop
    for (let id in pendingMatchQue) {
      loopIsRunning = true;

      let originalMatchingQue = {...pendingMatchQue};
      let U1 = originalMatchingQue[id];

      matchIndividual(U1)
      .then(U2 => {
        delete pendingMatchQue[U1.id];
        delete pendingMatchQue[U2.id];

        initRoom(U1, U2);

        loopIsRunning = false;
        if (pendingMatchQue.length >= 2 && originalMatchingQue != pendingMatchQue) { // We still have users to try to match that are not the same as the past users
          matchingLoop(i + 1);
        }
      })
      .catch(err => {
        console.log('CATCHED : ' + err);
        loopIsRunning = false;

        if (originalMatchingQue === pendingMatchQue || !(pendingMatchQue.length - 2)) { // We have the same users that we failed to match, OR there arent any more users to try to match
          console.log('No more users to match')
        } else {
          console.log('We have more users to match')
          matchingLoop(i+1);
        }
      })
    }
  };

  let matchIndividual = (U1) => new Promise(function (resolve, reject) {
    let cleanQue = Object.values(pendingMatchQue).filter(socket => socket.id != U1.id) // Remove the user being matched from the que in order to not match him with himself

    console.log('Attempting to match U1 ' + U1._data.firstName + ' with ' + cleanQue.length + ' user(s)');

    for (let i = 0; i < cleanQue.length; i++) {
      let U2 = cleanQue[i];
      let U1gender = U1._data.gender;
      let U1interests = U1._data.interests;
      let U2gender = U2._data.gender;
      let U2interests = U2._data.interests;

      if (U1interests.includes(U2gender) && U2interests.includes(U1gender)) {
        console.log('Match has been made')
        resolve(U2);
        break
      } else if (i >= cleanQue.length - 1) {
        reject('Could not find any matches')
      }
    }
  });

  const removeFromMatchQue = (socket_id) => {
    delete pendingMatchQue[socket_id]
  }

  const initRoom = (U1, U2) => {
    roomName = randomId();
    U1.emit('match success', {name: U2._data.firstName, roomName});
    U2.emit('match success', {name: U1._data.firstName, roomName});
  }

  var nsp = io.of('/matching');

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
      socket.emit('subscribe success', String(Object.keys(pendingMatchQue).length));
      if (!loopIsRunning && Object.keys(pendingMatchQue).length >= 2) matchingLoop();
    });
    socket.on('disconnect', function() {
      removeFromMatchQue(socket.id)
    });
  });
}