const questions = require('../data/questions');

module.exports = (roomData) => { // users have been paired and can interact by now
  const emit_to_room = (type, payload) => {
    roomData.nsp.in(roomData.id).emit(type, payload);
  };

  const U1 = Object.values(roomData.users)[0];
  const U2 = Object.values(roomData.users)[1];

  Object.values(roomData.users).forEach(Un => { // handle events for each user
    Un.on('message', content => { // Handle message event for each user      
      emit_to_room('message', {sender: Un._data.firstName, content})
    });
    Un.on('ready', () => {
      if (roomData.isActive)  { // game is already going
        Un.emit('display', 'Game has already started');
        return
      }
      // this user is ready to play
      let { id } = Un;
      Un.isReadyToPlay = true
      
      // when a user is ready to play, assign them to inactive if there an active user
      // else if the is no active user, they will be the active user
      if (roomData.activeUser) {
        roomData.inactiveUser = roomData.users[id]
      } else {
        roomData.activeUser = roomData.users[id]
      }
      
      if (U1.isReadyToPlay && U2.isReadyToPlay) {
        roomData.activeUser.emit('isActive', true);
        roomData.isActive = true;
        nextQuestion(); // here is the first question!
      } else { // make sure the game still has not started and we are just lagging
        emit_to_room('display', Un._data.firstName + ' is ready to play!');
      }
    });
    Un.on('done', () => { // the user is done answering question
      let { activeUser, inactiveUser, users } = roomData;
      if (!activeUser) {
        return Un.emit('display', 'No active user');
      }
      if (!inactiveUser) {
        return Un.emit('display', 'Match is missing user...');
      }
      if (!roomData.isActive) {
        Un.emit('display', 'Waiting for all users to be ready.')
        return Un.emit('isActive', activeUser.id === Un.id)
      }
      if (activeUser.id == Un.id) { // if they were the active user
        // toggle the active / inactive users
        roomData.activeUser = users[inactiveUser.id];
        roomData.activeUser.emit('isActive', true);
        roomData.inactiveUser = users[Un.id];
        roomData.inactiveUser.emit('isActive', false);
        // move onto the next question!
        nextQuestion()
      } else { // its not your turn
        Un.emit('isActive', false);
        Un.emit('display', 'Its not your turn yet!');
      }
    });
    Un.on('typing', (status) => {
      Un.broadcast.emit('typing', { name: Un._data.firstName, status });
    });
  });

  // welcome both users
  emit_to_room('display', 'Matching complete. Welcome! Take this time to get to know each other');
  U1.emit('message', {sender: '36 Questions', content: 'You have been matched with ' + U2._data.firstName + '. Say hello!'});
  U2.emit('message', {sender: '36 Questions', content: 'You have been matched with ' + U1._data.firstName + '. Say hello!'});

  const nextQuestion = () => {
    if (roomData.currentTurn == 0) {
      roomData.currentTurn = 1
      roomData.currentQuestionIndex++
    } else {
      roomData.currentTurn = 0
    }
  
    let question = questions[roomData.currentQuestionIndex];
    if (question) {
      let { activeUser, inactiveUser } = roomData;
      if (roomData.currentTurn == 1) {
        activeUser.emit('display', 'Your turn to answer. ' + question.body)
        inactiveUser.emit('display', `${activeUser._data.firstName}'s turn to answer. "${question.body}"`)
      } else {
        activeUser.emit('display', 'Question: ' + question.body)
        inactiveUser.emit('display', `Question for ${activeUser._data.firstName}. "${question.body}"`)
      }
    } else {
      emit_to_room('end');
    }
  }
};