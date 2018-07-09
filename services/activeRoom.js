module.exports = (io) => {
  let rooms = [];

  const initRoom = (roomID) => {
    let roomData = {
      roomID,
      users: [],
      private: false,
      join: function (user) {
        if (this.users.length >= 2) return user.emit('join fail', 'This room is full');

        user.join(this.roomID, () => {
          user.on('disconnect', () => roomData.handleDisconnect(user.firstName));
          roomData.users.push(user);
          roomData.handleConnect(user);
        })
      },
      handleConnect: function (user) {
        user.emit('join success');
        if (this.users.length == 2) {
          nsp.in(roomData.roomID).emit('begin');
          // roomController(roomData);
        }
      },
      handleDisconnect: function (firstName) {
        if (roomData.users.length == 1) return roomData.users[0].emit('user disconnected', firstName);
      
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

      if (!firstName || !_id) return socket.emit('invalid information');
      if (!roomID || !userData) return socket.emit('invalid information');

      socket.data = userData;
      
      let roomAlreadyExists = rooms.find(room => room.roomID === roomID);

      if (!roomAlreadyExists) {
        return initRoom(roomID).join(socket)
      };
      if (!roomAlreadyExists.private) return roomAlreadyExists.join(socket);
      if (roomAlreadyExists.private === true) return // Make request asking to join if room is private
    });
    socket.on('disconnect', function() {
      console.log('User disconnected from rooms');
    });
  });
}