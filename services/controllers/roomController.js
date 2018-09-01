const questions = require('../questions');

module.exports = (roomData) => { // users have been paired and can interact by now
  const emit_to_room = (type, payload) => {
    roomData.nsp.in(roomData.id).emit(type, payload);
  };

  const set_speech = (users, condition) => {
    Object.values(users).forEach(user => {
      user.canTalk = condition;
      user.emit('set speech', condition);
    });
  };
  const U1 = Object.values(roomData.users)[0];
  const U2 = Object.values(roomData.users)[1];

  set_speech([U1, U2], true)

  Object.values(roomData.users).forEach(Un => { // handle events for each user
    Un.on('message', content => { // Handle message event for each user
      if (!Un.canTalk) return Un.emit('display', 'You cannot talk right now');
      
      emit_to_room('message', {sender: Un._data.firstName, content})
    });
    Un.on('ready', () => {
      // this user is ready to play
      Un.isReadyToPlay = true
      
      // when a user is ready to play, assign them to inactive if there an active user
      // else if the is no active user, they will be the active user
      if (roomData.activeUser) {
        roomData.inactiveUser = roomData.users[Un.id]
      } else {
        roomData.activeUser = roomData.users[Un.id]
      }
      
      if (U1.isReadyToPlay && U2.isReadyToPlay) { // START GAME!
        nextQuestion() // here is the first question!
      } else {
        emit_to_room('display', Un._data.firstName + ' is ready to play!')
      }
    });
    Un.on('done', () => { // the user is done answering question
      if (roomData.activeUser.id == Un.id) { // if they were the active user
        // toggle the active / inactive users
        roomData.activeUser = roomData.users[roomData.inactiveUser.id]
        roomData.inactiveUser = roomData.users[Un.id]

        // move onto the next question!
        nextQuestion()
      } else { // its not your turn
        Un.emit('display', 'Its not your turn yet!');
      }
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
      U1.emit('isActive', U1.id == roomData.activeUser.id) // Are you active?
      U2.emit('isActive', U2.id == roomData.activeUser.id) // or are you active?
      if (roomData.currentTurn == 1) {
        emit_to_room('display', `${roomData.activeUser._data.firstName}'s turn to answer. "${question.body}"`)
      } else {
        emit_to_room('display', `Question for ${roomData.activeUser._data.firstName}. "${question.body}"`)
      }
    } else {
      console.log('Game is over!')
      emit_to_room('end');
    }
  }
};