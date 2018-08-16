const roomController = require('./controllers/roomController');

module.exports = (io) => {
  let rooms = [];

  const initRoom = (roomID) => {
    let roomData = {
      nsp,
      roomID,
      users: {},
      join: function (socket) {
        if (Object.keys(this.users).length >= 2) return socket.emit('display', 'This room is full');
        if (this.users[socket.id]) return socket.emit('display', 'You are already in this room');
        
        socket.join(this.roomID, () => {
          socket.on('disconnect', () => roomData.handleDisconnect(socket));
          roomData.users[socket.id] = socket;
          roomData.handleConnect(socket);
        })
      },
      handleConnect: function (socket) {
        socket.emit('display', 'Joined room. Waiting for user..');
        if (Object.keys(roomData.users).length == 2) {
          nsp.in(roomData.roomID).emit('display', 'User has connected.');
          roomController(roomData);
        }
      },
      handleDisconnect: function (socket) {
        delete roomData.users[socket.id];

        if (roomData.users.length == 1) return roomData.users[0].emit('user disconnected', socket._data.firstName);
        if (roomData.users.length == 0) rooms.filter(r => r._id !== roomID);
      }
    };

    rooms.push(roomData);
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
      
      let existingRoom = rooms.find(room => room.roomID === roomID);

      if (!existingRoom) return initRoom(roomID).join(socket);
      
      existingRoom.join(socket);
    });
    socket.on('disconnect', function() {
      // socket.emit('disconnected');
    });
  });
}