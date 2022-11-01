const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Room = require("../models/room");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(
  "sk_test_51LwfrZSFEz6HFyOlrYUgYlfmVyipm2iJgSZDciTOL3F0Ij6NBF3QZPfv7C4nIr9UWncfrjxGg3nnrcZkCoU06iPW00JD3Bv6MI"
);

const moment = require("moment");

router.post("/bookroom", async (req, res) => {
  const { room, userid, fromdate, todate, totalamount, totaldays, token } = await req.body;

  try {
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    const payment = await stripe.charges.create(
      [{
        amount: totalamount * 100,
        customer: customer.id,
        currency: "INR",
        receipt_email: token.email,
      },
      {
        idempotencyKey: uuidv4(),
      },
      {mode: 'payment'}]
    );

    if (payment) {
      
        const newbooking = new Booking({
          room: room.name,
          roomid: room._id,
          userid,
          fromdate: moment(fromdate).format("DD-MM-YYYY"),
          todate: moment(todate).format("DD-MM-YYYY"),
          totalamount,
          totaldays,
          transactionId: "1234",
        });

        const booking = await newbooking.save();
        const roomtemp = await Room.findOne({ _id: room._id });

        roomtemp.currentbookings.push({
          bookingid: booking._id,
          fromdate: moment(fromdate).format("DD-MM-YYYY"),
          todate: moment(todate).format("DD-MM-YYYY"),
          userid: userid,
          status: booking.status,
        }); 

        await roomtemp.save();
        
    }
    res.send("Payment Successfull, your room is booked ");
  } catch (error) {
    console.log(error)
    return res.status(400).json({error});
  
  }

});


router.post("/getboookingsuserbyid",async (req,res)=>{
  const userid= req.body.userid

  try {
    const bookings= await Booking.find({userid : userid})
    res.send(bookings)
  } catch (error) {
    return res.status(400).json({error});
  }
})

router.get("/getallbookings", async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.send(bookings);
  } catch (error) {
    return res.status(400).json({ message: error });
  }
});


module.exports = router;
