const users = [];
const Rooms = require('../models/Rooms');

 //Join user to chat
 function userJoin(id, username, room){
   const user = {id, username, room};

   users.push(user);
   return user;
 }

 //Get current User
function getCurrentUser(id){
  return users.find(user => user.id === id);
}

//User leaves chat
function userLeave(id){
  const index = users.findIndex(user => user.id === id);

  if(index!== -1){
    return users.splice(index, 1)[0];
  }
}

//Get room users
function getRoomUsers(room) {
  var members = [];
  members = Rooms.findOne({name:room}, async(err, found) =>{
    return found.users;
  });
    console.log('members=' + members.users);
  return members.users;
  // return users.filter(user => user.room===room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
}
