module.exports = (io) => {
  io.on('connection', function(socket) {
    socket.on('subscribe room', function(roomName) {

    });
    socket.on('disconnect', function() {
      console.log('User disconnected from active room');
    });
  });
}