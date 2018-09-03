const roomController = require('../controllers/roomController');

module.exports = (io) => {
  let ACTIVE_ROOMS = [];

  const initRoom = (roomID) => {
    let roomData = {
      nsp,
      id: roomID,
      users: {},
      currentQuestionIndex: -1, // what question number we are currently at! We start at -1 so that on the first turn, it increases to 0
      currentTurn: 0, // the user currently answering the question, as they must take turns doing so. toggles between 0 and 1
      join: function (socket) {
        let { users } = this;
        if (Object.keys(users).length >= 2) return socket.emit('joined', { message: 'This room is full', res: false});
        if (users[socket.id]) return socket.emit('joined', { message: 'You are already in this room', res: false });
        
        socket.join(roomData.id, () => {
          roomData.users[socket.id] = socket;
          roomData.handleConnect(socket);
          socket.on('disconnect', () => roomData.handleDisconnect(socket));
        })
      },
      handleConnect: function (socket) {
        socket.emit('joined', { res: true })
        socket.emit('display', 'Joined room. Waiting for user..');
        if (Object.keys(roomData.users).length == 2) {
          roomController(roomData);
        }
      },
      handleDisconnect: function (socket) {
        delete roomData.users[socket.id];
        roomData.isActive = false; // the game is not active (for the moment, until user length is back to 2)

        if (Object.keys(roomData.users).length == 1) {
          nsp.in(roomData.id).emit('user disconnected', socket._data.firstName)
        } else if (Object.keys(roomData.users).length == 0) {
          ACTIVE_ROOMS = ACTIVE_ROOMS.filter(r => r.id !== roomID)
        }
      }
    };

    ACTIVE_ROOMS.push(roomData);
    return roomData;
  };

  var nsp = io.of('/api/rooms')
  nsp.on('connection', function(socket) {
    socket.on('join room', function(userData) {
      let roomID = socket.handshake.query.id && typeof socket.handshake.query.id === 'string' ? socket.handshake.query.id : false;

      if (!roomID || !userData) return socket.emit('joined', { message: 'Missing data', res: false });

      let {firstName, _id} = userData;
      if (!firstName || !_id) return socket.emit('joined', { message: 'Missing user data', res: false });

      socket._data = userData;
      
      let existingRoom = ACTIVE_ROOMS.find(room => room.id === roomID);

      if (!existingRoom){
        initRoom(roomID).join(socket)
      } else {
        existingRoom.join(socket);
      }
    });
  });
}