const questions = require('../data/questions');

class Room {
  constructor(id, nsp, ACTIVE_ROOMS) {
    this.id = id
    this.nsp = nsp
    this.ACTIVE_ROOMS = ACTIVE_ROOMS
    this.users = {}
    this.currentQuestionIndex = -1
    this.currentTurn = 0
    this.isActive = false
    this.inactiveUser = null
    this.activeUser = null
  }
  join (socket) {
    let { users } = this;
    if (Object.keys(users).length >= 2) return socket.emit('joined', { message: 'This room is full', res: false});
    
    socket.join(this.id, () => {
      this.users[socket.id] = socket;

      this.bindSocket(socket);
      this.handleConnect(socket);
      socket.on('disconnect', () => this.handleDisconnect(socket));
    })
  }
  bindSocket(socket) {
    socket.on('message', content => { // Handle message event for each user  
      if (content.trim() === '') return    
      this.emit_to_room('message', {sender: socket.userData.firstName, content})
    });
    socket.on('ready', () => {
      if (this.isActive)  { // game is already going
        socket.emit('display', 'Game has already started');
        return
      }
      // this user is ready to play
      let { id } = socket;
      socket.isReadyToPlay = true
      
      // when a user is ready to play, assign them to inactive if there an active user
      // else if the is no active user, they will be the active user
      if (this.activeUser) {
        console.log(socket.userData.firstName + ' = inactive user')
        this.inactiveUser = this.users[id]
      } else {
        console.log(socket.userData.firstName + ' = active user')
        this.activeUser = this.users[id]
        this.emit_to_room('display', socket.userData.firstName + ' is ready to play!');
      }

      if (!this.activeUser || !this.inactiveUser) return

      if (this.activeUser.isReadyToPlay && this.inactiveUser.isReadyToPlay) {
        this.activeUser.emit('isActive', true);
        this.inactiveUser.emit('isActive', false);
        this.isActive = true;
        this.nextQuestion(); // here is the first question!
      }
    });
    socket.on('done', () => { // the user is done answering question
      let { activeUser, inactiveUser } = this;

      if (!activeUser) {
        return socket.emit('display', 'Waiting for users.');
      }
      if (!inactiveUser) {
        return socket.emit('display', 'Waiting for users to be ready.');
      }
      if (!this.isActive) {
        socket.emit('display', 'Waiting for all users to be ready.')
        return socket.emit('isActive', isActiveUser)
      }

      let isActiveUser = activeUser.id === socket.id;

      socket.emit('isActive', isActiveUser);

      if (isActiveUser) { // if they were the active user
        this.toggleActiveUser(socket);
        // move onto the next question!
        this.nextQuestion()
      } else { // its not your turn
        socket.emit('isActive', false);
        socket.emit('display', 'Its not your turn yet!');
      }
    });
    socket.on('typing', (status) => {
      socket.broadcast.emit('typing', { name: socket.userData.firstName, status });
    });
  }
  handleConnect(socket) {
    socket.emit('joined', { res: true })
    
    socket.emit('display', 'Joined room. Waiting for user..');
    
    if (Object.keys(this.users).length == 2) {
      if(this.currentQuestionIndex > -1) {
        if (this.activeUser) {
          this.activeUser.emit('isActive', true)
        }
        this.nextQuestion()
        return
      }
      
      let usersArray = Object.values(this.users)
      let U1 = usersArray[0];
      let U2 = usersArray[1];
      this.emit_to_room('display', 'Matching complete. Welcome! Take this time to get to know each other');
      U1.emit('message', {sender: '36 Questions', content: 'You have been matched with ' + U2.userData.firstName + '. Say hello!'});
      U2.emit('message', {sender: '36 Questions', content: 'You have been matched with ' + U1.userData.firstName + '. Say hello!'});
    }
  }
  handleDisconnect (socket) {
    delete this.users[socket.id];
    this.isActive = false; // the game is not active (for the moment, until user length is back to 2)

    if (this.activeUser && this.activeUser.id === socket.id) {
      this.activeUser = null
    } else if (this.inactiveUser && this.inactiveUser.id === socket.id) {
      this.inactiveUser = null
    }

    if (Object.keys(this.users).length == 1) {
      this.nsp.in(this.id).emit('user disconnected', socket.userData.firstName)
    } else if (Object.keys(this.users).length == 0) {
      delete this.ACTIVE_ROOMS[this.id]
    }
  }

  emit_to_room(type, payload) {
    this.nsp.in(this.id).emit(type, payload);
  };
  
  toggleActiveUser(socket) {
    // toggle the active / inactive users
    this.activeUser = this.users[this.inactiveUser.id];
    this.activeUser.emit('isActive', true);
    this.inactiveUser = this.users[socket.id];
    this.inactiveUser.emit('isActive', false);
  }
  nextQuestion() {
    if (!this.isActive) { // this game is not active!
      return
    }
    if (this.currentTurn == 0) {
      this.currentTurn = 1
      this.currentQuestionIndex++
    } else {
      this.currentTurn = 0
    }
    let { currentQuestionIndex } = this;

    let question = questions[currentQuestionIndex];
    
    if (question) {
      this.emit_to_room('question index', currentQuestionIndex + 1);
      let { activeUser, inactiveUser } = this;
      if (this.currentTurn == 1) {
        activeUser.emit('display', 'Your turn to answer. ' + question.body)
        inactiveUser.emit('display', `${activeUser.userData.firstName}'s turn to answer. "${question.body}"`)
      } else {
        activeUser.emit('display', 'Question: ' + question.body)
        inactiveUser.emit('display', `Question for ${activeUser.userData.firstName}. "${question.body}"`)
      }
    } else {
      this.ending()
    }
  }

  ending() {
    this.isActive = false
    this.emit_to_room('end');
    this.emit_to_room('isActive', false);
    this.emit_to_room('display', 'You have both made it to the end');

    messages = [
      'Now comes the most difficult part',
      'If you would like to get to know each other then by all means do so',
      'You can continue to chat for as long as you wish.'
    ];

    let i = 0;
    let interval = setInterval(() => {
      let { users } = this;
      let m = messages[i]
      if (!m || Object.keys(users).length < 2) {
        this.emit_to_room('display', '');
        return clearInterval(interval)
      }
      this.emit_to_room('display', m)
      i++
    }, 4000);
  }
}

module.exports = Room