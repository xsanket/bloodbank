const router = require('express').Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Inventory = require("../models/inventoryModel")
const User = require('../models/userModel');
const mongoose = require("mongoose");


router.post("/add", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) throw new Error("Invalid Email")

        if (req.body.inventoryType === "in" && user.userType !== "donar") {
            throw new Error("This email is not registered as a donar")
        }
        if (req.body.inventoryType === "out" && user.userType !== "hospital") {
            throw new Error("This email is not registered as a hospital")
            req.body.hospital = user._id;
        }

        if (req.body.inventoryType === "out") {

            const requestedGroup = req.body.bloodGroup;
            const requestedQuantity = req.body.quantity;
            const organization = new mongoose.Types.ObjectId(req.body.userId);
            //inventory inStock
            const totalInOfRequestedGroup = await Inventory.aggregate([
                {
                    $match: {
                        organization,
                        inventoryType: "in",
                        bloodGroup: requestedGroup,
                    },
                },
                {
                    $group: {
                        _id: "$bloodGroup",
                        total: { $sum: "$quantity" },
                    },
                },

            ]);

            const totalIn = totalInOfRequestedGroup[0]?.total || 0;

            //inventory out
            const totalOutOfRequestedGroup = await Inventory.aggregate([
                {
                    $match: {
                        organization,
                        inventoryType: "out",
                        bloodGroup: requestedGroup,
                    },
                },
                {
                    $group: {
                        _id: "$bloodGroup",
                        total: { $sum: "$quantity" },
                    },
                },

            ]);
            const totalOut = totalOutOfRequestedGroup[0]?.total || 0;


            const availableQuantityOfRequestedGroup = totalIn - totalOut;
            if (availableQuantityOfRequestedGroup < requestedQuantity) {
                throw new Error( `only ${availableQuantityOfRequestedGroup} units of ${requestedGroup.toUpperCase()} is available` );
            };


            req.body.hospital = user._id;
        }

        else {
            req.body.donar = user._id;
        }

        //save 
        const inventory = new Inventory(req.body);
        await inventory.save();

        return res.send({
            success: true,
            message: "Inventory added Successfully"
        });

    } catch (error) {
        console.log("ithe error hay");
        return res.send({
            success: false,
            message: error.message,

        }) 
    }
});


//get inventory api

router.get("/get", authMiddleware, async (req, res) => {
    try {
        
        const inventory = await Inventory.find({ organization: req.body.userId }).sort({createdAt: -1})
            .populate("donar")
            .populate("hospital");
        return res.send({ success: true, data: inventory });
    } catch (error) {
        return res.send({
            success: false,
            message: error.message
        });

    }
});


router.post("/filter", authMiddleware, async (req, res) => {
    try {
        console.log(req.body.filters)
        const inventory = await Inventory.find(req.body.filters).sort({createdAt: -1})
            .populate("donar")
            .populate("hospital").populate("organization");
        return res.send({ success: true, data: inventory });
    } catch (error) {
        return res.send({
            success: false,
            message: error.message
        });

    }
});




module.exports = router;