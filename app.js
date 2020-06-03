const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const moment = require('moment');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//BODYPARSER CONFIGURATION
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())

//ALL DATABASE CONFIGURATION AND IMPORTS
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://admin:admin@cluster0-nbxxl.mongodb.net/chatms?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology:true});
const Rooms = require('./models/Rooms');



//IMPORTING AND USING ROUTES FILES
const roomRoute = require('./routes/room_routes.js');
app.use('/',roomRoute);

const botName = 'Admin';

// io.sockets
//   .on('connection', socketioJwt.authorize({
//     secret: 'SECRET_KEY',
//     timeout: 15000 // 15 seconds to send the authentication message
//   })).on('authenticated', function(socket) {
//     //this socket is authenticated, we are good to handle more events from it.
//     console.log('hello! ' + socket.decoded_token.name);
//   });
//RUN WHEN CLIENT CONNECTS
io.on('connection', socket => {
  socket.on('joinRoom', ({username, room}) => {

      Rooms.findOne({name:room, users:username}, async(err, found)=>{
        if(err){
          console.log(err);
          return err;
        }
        if(!found){
          return 'Not allowed to enter this room.';
        }
        if(found){

      const user = userJoin(socket.id, username, room);
      socket.join(user.room);

      //Welcome current user
      // socket.emit('message', formatMessage(botName,'Welcome to ChatCord'));
      var messages = [];
      var members = [];
      Rooms.findOne({name:room}, async(err, found)=>{
        if(err){
          console.log(err);
        }
        if(found){
          messages = await found.messages;
          members = await found.users;
          // console.log('users = ' + members);
          // console.log('messages = ' + messages);
           socket.emit('oldmessage', messages);
           //Send user and room info
           io.to(user.room).emit('roomUsers',{
             room:user.room,
             users: members
           });
        }
      });
    }
  });

      //Broadcast when a user connects
      // socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat.`));
      // var returned = getRoomUsers(user.room)
      // console.log('in app.js ' + returned);
      //Send user and room info
      // io.to(user.room).emit('roomUsers',{
      //   room:user.room,
      //   users: getRoomUsers(user.room)
      // });
  });


  //Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if(user){
        // io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat.`));

        io.to(user.room).emit('roomUsers',{
          room:user.room,
          users: getRoomUsers(user.room)
        });
    }
  });

  //Listen to chat message
  socket.on('chatMessage', ({msg,username,room}) => {
    // const user = getCurrentUser(socket.id);
    Rooms.findOne({name:room}, async(err, found)=>{
      if(err){
        console.log(err);
      }
      if(found){
        const newmessage = {
          user:username,
          text:msg,
          time:moment().format('h:mm a'),
          date:moment(new Date()).format("DD/MM/YYYY")
        };
        found.messages.push(newmessage);
        await found.save();
        console.log('New message saved Successfully');
      }
    });
    io.to(room).emit('message', formatMessage(username,msg));
    // io.to(user.room).emit('message', formatMessage(user.username,msg));
  });
});

server.listen(process.env.PORT || 3000, function(){
  console.log(`Server is running on port 3000`);
});
