const mongoose = require("mongoose");

var mongoURL ='mongodb+srv://HotelMS:HotelMS@cluster0.9norjqt.mongodb.net/MernRooms'

mongoose.connect(mongoURL, {useUnifiedTopology: true, useNewUrlParser: true})

var connection = mongoose.connection

connection.on('error',()=>{
    console.log("mongo connection failed")
})

connection.on('connected',()=>{
    console.log("Mongo connection success.")
})

module.export = mongoose