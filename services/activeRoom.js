const roomController = require('./controllers/roomController');

module.exports = (io) => {
  let ACTIVE_ROOMS = [];

  const initRoom = (roomID) => {
    let roomData = {
      nsp,
      id: roomID,
      users: {},
      join: function (socket) {
        if (Object.keys(this.users).length >= 2) return socket.emit('display', 'This room is full');
        if (this.users[socket.id]) return socket.emit('display', 'You are already in this room');
        
        socket.join(roomData.id, () => {
          roomData.users[socket.id] = socket;
          roomData.handleConnect(socket);
          socket.on('disconnect', () => roomData.handleDisconnect(socket));
        })
      },
      handleConnect: function (socket) {
        socket.emit('display', 'Joined room. Waiting for user..');
        if (Object.keys(roomData.users).length == 2) {
          nsp.in(roomData.id).emit('display', 'User has connected.');
          roomController(roomData);
        }
      },
      handleDisconnect: function (socket) {
        delete roomData.users[socket.id];

        if (Object.keys(roomData.users).length == 1) {
          nsp.in(roomData.id).emit('user disconnected', socket._data.firstName)
        } else if (Object.keys(roomData.users).length == 0) {
          console.log("FILTERING ROOM " + roomID)
          ACTIVE_ROOMS = ACTIVE_ROOMS.filter(r => r.id !== roomID)
        }
      }
    };

    ACTIVE_ROOMS.push(roomData);
    return roomData;
  };

  var nsp = io.of('/rooms')
  nsp.on('connection', function(socket) {
    socket.on('join room', function(userData) {
      let roomID = socket.handshake.query.id ? socket.handshake.query.id : false;

      let {firstName, _id} = userData;

      if (!firstName || !_id) return socket.emit('display', 'invalid information');
      if (!roomID || !userData) return socket.emit('display', 'invalid information');

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