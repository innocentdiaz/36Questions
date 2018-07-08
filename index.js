const http = require('http');
const express = require('express');
const app = express();

app.use(express.json());

var server = http.createServer(app);
const io = require('socket.io')(server);

require('./services/auth')(app);
require('./services/matching')(io);

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(__dirname + '/build/index.html');
  })
};

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log('Listening at port ', PORT))