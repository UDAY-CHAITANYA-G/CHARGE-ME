const express = require("express");
const Station = require("../../../Schema/StationSchema");
const booking = require("../../../Schema/BookingHistory");
const User = require("../../../Schema/UserSchema");
const Router = express.Router();

Router.get("/:level/:station",function(req,res){
     if(req.isAuthenticated()&& req.session.role === "user"){
        Station.findOne({station_Name: req.params.station},function(err,station){
            booking.find({StationName: req.params.station,chargerType: req.params.level},function(err,bookings){
                let bookedslots = 0;
                bookings.forEach(booking => {
                    if(booking.slotNumber){
                        bookedslots = bookedslots + 1
                    }
                });
                let availableSlotCount = 0
                let price;
                station.AvailableTypes.map(function(type){
                    if(type.level === req.params.level && type.slots !== 0){
                        availableSlotCount = availableSlotCount+type.slots
                        price = type.Price;
                    }
                });  
                availableSlotCount = availableSlotCount - bookedslots;
                res.render("User/station-interface",{station: station,slots: availableSlotCount ,price: price,level: req.params.level});
            });     
        });

    }
    else{
        res.redirect("/login");
    }
});

Router.post("/:level/:station",function(req,res){
    if(req.isAuthenticated()&& req.session.role === "user"){
        User.findOne({UserName: req.user.username},function(err,user){
            const book = new booking({
                UserName: user.UserName,
                UserID: user._id.toString().substring(0,6),
                userMobile: user.Mobile,
                StationName: req.params.level,
                chargerType: req.params.station,
                Date: req.body.date,
                slotNumber: req.body.slotNumber,
                time: req.body.time,
                price: req.body.price,
                energyCharged: 700,
                status: req.body.status
            });
            book.save(function(err){
                if(!err){
                    console.log("Booking successfull");
                    res.redirect("/user/dashboard");
                }
                else{
                    console.log(err);
                }
            });
        });    
    }
    else{
        res.redirect("/login");
    }  
});


module.exports = Router;