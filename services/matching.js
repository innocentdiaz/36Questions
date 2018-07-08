module.exports = (io) => {
  var pendingMatchQue = [];
  var loopIsRunning = false;

  const matchingLoop = (i = 0) => { // This is the main loop
    console.log('attempting matches')
    if (loopIsRunning) return console.log('Already running');
    if (!pendingMatchQue[i]) return loopIsRunning = false;

    loopIsRunning = true;

    let originalMatchingQue = [...pendingMatchQue];
    let U1 = originalMatchingQue[i];

    matchIndividual(U1)
    .then((U2) => {
      pendingMatchQue = pendingMatchQue.filter(USER => USER != U1 && USER != U2);

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
  };

  let matchIndividual = (U1) => new Promise(function (resolve, reject) {
    let cleanQue = pendingMatchQue.filter(USER => USER != U1);
    console.log('Attempting to match U1 ' + U1.data.name + ' with ' + cleanQue.length + ' user(s)');

    for (let i = 0; i < cleanQue.length; i++) {
      let U2 = cleanQue[i];
      let U1gender = U1.data.gender;
      let U1interests = U1.data.interests;
      let U2gender = U2.data.gender;
      let U2interests = U2.data.interests;


      console.log('Attempting to match with ' + U2.data.name);
      if (U1interests.includes(U2gender) && U2interests.includes(U1gender)) {
        console.log('Match has been made')
        resolve(U2);
        break
      } else if (i >= cleanQue.length - 1) {
        console.log('rejecting. No matches found in the que')
        reject('Could not find any matches')
      }
    }
  });


  const addToMatchQue = (socket) => {
    if (!pendingMatchQue.includes(socket)) { // Need to fix this
      console.log(socket.data.name + ' is at pos ' + pendingMatchQue.indexOf(socket));
      pendingMatchQue.push(socket);
      socket.emit('subscribe success');

      if (!loopIsRunning && pendingMatchQue.length >= 2) matchingLoop();
    }
  };

  const removeFromMatchQue = (socket) => {
    pendingMatchQue = pendingMatchQue.filter(u => u != socket);
    socket.emit('subscribe disconnect');
  };

  const initRoom = (U1, U2) => {
    roomName = null;
    U1.emit('match success', {name: U2.data.name, roomName});
    U2.emit('match success', {name: U1.data.name, roomName});

    // both will now join a room
  }

  io.on('connection', function(socket) {
    socket.on('subscribeToQue', (data) => {
      socket.data = {
        name: data.name || 'anon',
        interests: data.interests.filter(interest=>interest.toLowerCase()),
        gender: data.gender.toLowerCase()
      }
      
      addToMatchQue(socket);
    });
    socket.on('disconnect', function() {
      removeFromMatchQue(socket);
    });
  });
}