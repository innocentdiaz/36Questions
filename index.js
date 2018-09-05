const http = require('http');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path')

let { DBHost } = process.env;

if (!DBHost) {
  throw "MISSING ENVIORMENTAL VARIABLE"
}

mongoose.connect(process.env.DBHost, { useNewUrlParser: true });

app.use(cors());

app.use(express.json());

var server = http.createServer(app);
const io = require('socket.io')(server);

require('./lib/routes/auth')(app);
require('./lib/routes/users')(app);
require('./lib/routes/matching')(io.of('/api/matching'));
require('./lib/routes/rooms')(io.of('/api/rooms'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'client', 'build')))

  app.get('*', (req, res) => {
    res.sendFile(__dirname + '/client/build/index.html');
  });
};

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log('Listening at port ', PORT))