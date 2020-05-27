const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Admin';

//RUN WHEN CLIENT CONNECTS
io.on('connection', socket => {



  socket.on('joinRoom', ({username, room}) => {
      const user = userJoin(socket.id, username, room);

      socket.join(user.room);

      //Welcome current user
      socket.emit('message', formatMessage(botName,'Welcome to ChatCord'));

      //Broadcast when a user connects
      socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat.`));

      //Send user and room info
      io.to(user.room).emit('roomUsers',{
        room:user.room,
        users: getRoomUsers(user.room)
      });
  });


  //Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if(user){
        io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat.`));

        io.to(user.room).emit('roomUsers',{
          room:user.room,
          users: getRoomUsers(user.room)
        });
    }
  });

  //Listen to chat message
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username,msg));
  });
});

server.listen(process.env.PORT || 3000, function(){
  console.log(`Server is running on port 3000`);
});
