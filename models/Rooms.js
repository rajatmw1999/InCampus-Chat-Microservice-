const mongoose = require('mongoose');
const RoomSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  type:{
    type:String,
    required:true
  },
  admin:{
    type:String,
    required:true
  },
  users:[
    {
      type:String
    }
  ],
  messages:[
    {
      user:{
        type:String
      },
      text:{
        type:String
      },
      date:{
        type:String
      },
      time:{
        type:String
      }
    }
  ]
});

const Room = mongoose.model("room",RoomSchema);
module.exports = Room;
