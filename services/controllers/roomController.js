const set_speech = (users, condition) => {
  Object.values(users).forEach(user => {
    user.canTalk = condition;
    user.emit('set speech', condition);
  });
};

const displayRules = (emit_to_room, cb) => {
  emit_to_room('display', 'Before anything else, lets go over the rules.');
  setTimeout(function(){
    emit_to_room('display', 'Firstly, your partner will be given a question to ask you - ')
    setTimeout(function(){
      emit_to_room('display', 'You will then answer this question. Some questions may be timed, but that is not important.')
      setTimeout(function(){
        emit_to_room('display', 'Once you have answered the question, it will be your partners turn to answer the same question.')
        setTimeout(function(){
          emit_to_room('display','After they have answered, we will move onto the next question. Simple, no?')
          setTimeout(function(){
            emit_to_room('display', 'You may now take this time to get to introduce yourselves, and begin once you are ready');
            cb()
          }, 42)
        }, 42)
      }, 42)
    }, 40)
  }, 40)
};

module.exports = (roomData) => {
  const U1 = Object.values(roomData.users)[0];
  const U2 = Object.values(roomData.users)[1];
  U1.canTalk = false;
  U2.canTalk = false;

  const nsp = roomData.nsp;

  const emit_to_room = (type, payload) => {
    nsp.in(roomData.roomID).emit(type, payload);
  };

  Object.values(roomData.users).forEach(Un => {
    Un.on('message', (content) => { // Handle message event for each user
      if (!Un.canTalk) return Un.emit('display', 'You cannot talk right now');
      
      emit_to_room('message', {sender: Un._data.firstName, content})
    });
    Un.on('continue', () => {
      if (roomData.continue) roomData.continue(Un._data.firstName)
    })
  });

  emit_to_room('display', 'Matching complete. Welcome.');

  setTimeout(function(){
    set_speech([U1, U2], false)
    U1.emit('message', {sender: 'Controller', content: 'You have been matched with ' + U2._data.firstName + '. Say hello!'});
    U2.emit('message', {sender: 'Controller', content: 'You have been matched with ' + U1._data.firstName + '. Say hello!'});

    const callback = () => {
      set_speech([U1, U2], true);
      // This is where we have left off at :)
    }

    setTimeout(function(){displayRules(emit_to_room, callback)}, 3000);
  }, 1500);
};