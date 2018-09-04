const questions = require('../data/questions');

module.exports = (roomData) => { // users have been paired and can interact by now
  const emit_to_room = (type, payload) => {
    roomData.nsp.in(roomData.id).emit(type, payload);
  };

  const U1 = Object.values(roomData.users)[0];
  const U2 = Object.values(roomData.users)[1];

  Object.values(roomData.users).forEach(Un => { // handle events for each user
    Un.on('message', content => { // Handle message event for each user      
      emit_to_room('message', {sender: Un.userData.firstName, content})
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
      } else {
        emit_to_room('display', Un.userData.firstName + ' is ready to play!');
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
      Un.broadcast.emit('typing', { name: Un.userData.firstName, status });
    });
  });

  // welcome both users
  emit_to_room('display', 'Matching complete. Welcome! Take this time to get to know each other');
  U1.emit('message', {sender: '36 Questions', content: 'You have been matched with ' + U2.userData.firstName + '. Say hello!'});
  U2.emit('message', {sender: '36 Questions', content: 'You have been matched with ' + U1.userData.firstName + '. Say hello!'});

  const nextQuestion = () => {
    if (!roomData.isActive) { // this game is not active!
      return
    }
    if (roomData.currentTurn == 0) {
      roomData.currentTurn = 1
      roomData.currentQuestionIndex++
    } else {
      roomData.currentTurn = 0
    }
    let { currentQuestionIndex } = roomData;

    let question = questions[currentQuestionIndex];
    
    if (question) {
      emit_to_room('question index', currentQuestionIndex + 1);
      let { activeUser, inactiveUser } = roomData;
      if (roomData.currentTurn == 1) {
        activeUser.emit('display', 'Your turn to answer. ' + question.body)
        inactiveUser.emit('display', `${activeUser.userData.firstName}'s turn to answer. "${question.body}"`)
      } else {
        activeUser.emit('display', 'Question: ' + question.body)
        inactiveUser.emit('display', `Question for ${activeUser.userData.firstName}. "${question.body}"`)
      }
    } else {
      ending()
    }
  }

  const ending = () => {
    roomData.isActive = false
    emit_to_room('end');
    emit_to_room('isActive', false);
    emit_to_room('display', 'You have both made it to the end');

    messages = [
      'Now comes the most difficult part',
      'If you would like to get to know each other then by all means do so',
      'You can continue to chat for as long as you wish.'
    ];

    let i = 0;
    let interval = setInterval(() => {
      let { users } = roomData;
      let m = messages[i]
      if (!m || Object.keys(users).length < 2) {
        emit_to_room('display', '-');
        return clearInterval(interval)
      }
      emit_to_room('display', m)
      i++
    }, 4000);
  }
};