// const roomController = require('../controllers/roomController');
var ACTIVE_ROOMS = {};
const Room = require('../controllers/Room');

module.exports = (io) => {
  var nsp = io.of('/api/rooms')

  nsp.on('connection', function(socket) {
    socket.on('join room', function(userData) {
      let roomID = socket.handshake.query.id && typeof socket.handshake.query.id === 'string' ? socket.handshake.query.id : false;

      if (!roomID || !userData) return socket.emit('joined', { message: 'Missing data', res: false });

      let {firstName, _id} = userData;
      if (!firstName || !_id) return socket.emit('joined', { message: 'Missing user data', res: false });

      socket.userData = userData;
      
      let existingRoom = ACTIVE_ROOMS[roomID];

      if (!existingRoom){
        let room = new Room(roomID, nsp, ACTIVE_ROOMS)
        ACTIVE_ROOMS[roomID] = room
        room.join(socket)
      } else {
        existingRoom.join(socket);
      }
    });
  });
}