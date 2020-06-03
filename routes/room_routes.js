const router = require("express").Router();

const Rooms = require('../models/Rooms');

//ROUTE TO CREATE A NEW ROOM.
//NAME OF THE ROOM, TYPE OF ROOM(TECH, BUSINESS ETC), ADMIN ID OF ADMIN OF ROOM(THAT IS, ID OF USER WHO CREATED THE ROOM)
router.post('/createRoom', async(req, res) => {
  const {name, type, admin} = req.body;
  const newRoom = new Rooms({
    name:name,
    type:type,
    admin:admin
  });
  await newRoom.save();
  return res.status(200).send('Successfully Created Room');
});

//ROUTE TO CHECK IF A ROOM NAME ALREADY EXISTS
//THIS ROUTE CAN BE USED OVER A AJAX REQUEST TO CHECK IF ROOM NAME EXISTS BEFORE SUBMITTING BY THE FRONT END TEAM.
router.post('/roomNameExist', async(req, res) =>{
  const {name} = req.body;
  Rooms.findOne({name:name}, async(err, found) => {
    if(err){
      console.log(err);
      return res.status(400).send(err);
    }
    if(found){
      return res.status(400).send('Room with this name already exists.');
    }
    return res.status(200).send('Good to go! No room with this name exists.');
  });
});

//ROUTE TO DISPLAY ALL ROOMS OF A PARTICULAR TYPE, SO USERS CAN CLICK AND JOIN IT.
router.post('/getAllRoomsOfOneType', async(req, res)=>{
  const {type} = req.body;
  Rooms.find({type:type}, async(err, found) => {
    if(err){
      console.log(err);
      return res.status(400).send(err);
    }
    if(found.length === 0){
      return res.status(400).send('No existing room of this type exists!');
    }
    var roomsInfo = [];
    found.forEach(async(room)=>{
      var newRoom = {
        name:room.name,
        type:room.type,
        admin:room.admin
      }
      await roomsInfo.push(newRoom);
    });
    return res.status(200).send(roomsInfo);
    });
});

//ROUTE TO GET ALL THE ROOMS AVAILABLE
router.get('/getAllRooms', async(req,res)=>{
  Rooms.find({}, async(err, found) => {
    if(err){
      console.log(err);
      return res.status(400).send(err);
    }
    if(found.length === 0){
      return res.status(400).send('No rooms available!');
    }
    var roomsInfo = [];
    found.forEach(async(room)=>{
      var newRoom = {
        name:room.name,
        type:room.type,
        admin:room.admin
      }
      await roomsInfo.push(newRoom);
    });
    return res.status(200).send(roomsInfo);
  });
});

//ROUTE TO ADD A NEW USER TO A ROOM
//THIS WILL ACCEPT THE ROOM NAME AND THE NEW USER ID AND WILL CHECK IF THE USER ALREADY EXISTS IN THAT ROOM AND ADD HIM SUBSEQUENTLY.
router.post('/joinRoom', async(req, res)=>{
  const {roomname, newuser} = req.body;
  Rooms.findOne({name:roomname}, async(err, found)=>{
    if(err){
      console.log(err);
      return res.status(400).send(err);
    }
    if(!found){
      return res.status(404).send('No such room exists.');
    }
    await found.users.push(newuser);
    await found.save();
    return res.status(200).send(`New User ${newuser} Successfully Added to Room ${roomname}`);
  });
});

//ROUTE TO GET ALL THE MESSAGES OF A ROOM
router.get('/messages/:Room', async(req, res) => {
  const roomname = req.params.Room;
  Rooms.findOne({name:roomname}, async(err, found) => {
    if(err){
      console.log(err);
      return res.status(400).send(err);
    }
    if(!found){
      return res.status(404).send('No such room exists.');
    }
    else{
      console.log(found);
      return res.json(found.messages);
    }
  });
});

//ROUTE TO LEAVE A ROOM
router.post('/leaveRoom', async(req, res)=>{
  const {roomname, newuser} = req.body;
  Rooms.findOne({name:roomname}, async(err, found)=>{
    if(err){
      console.log(err);
      return res.status(400).send(err);
    }
    if(!found){
      return res.status(404).send('No such room exists.');
    }
    await Rooms.findOneAndUpdate({name:roomname },
    { $pull: { users: { $in: newuser } } },
    function(err, data){
      console.log(data);
      return res.status(200).send(`User ${newuser} Successfully removed from Room ${roomname}`)
    });
  });
});


//ROUTE TO GET ALL ROOMS IN WHICH A USER IS JOINED
router.post('/getUsersRooms', async(req, res)=>{
  const {username} = req.body;
  Rooms.find({ users: { $in: username } }, async(err, found)=>{
    if(err){
      console.log(err);
      return res.status(400).send(err);
    }
    if(found.length === 0){
      return res.status(404).send('User is not a participant of any room.');
    }
    else{
      var roomsInfo = [];
      found.forEach(async(room)=>{
        var newRoom = {
          name:room.name,
          type:room.type,
          admin:room.admin
        }
        await roomsInfo.push(newRoom);
      });
      return res.status(200).send(roomsInfo);
    }
  });
});

module.exports = router;
