const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const jwt = require("jsonwebtoken");
const authMiddleware = require('../middlewares/authMiddleware');
const { default: mongoose } = require('mongoose');
const Inventory = require("../models/inventoryModel");


//new user register
router.post('/register', async (req, res) => {
    try {
        //check user already exist
        const userExist = await User.findOne({ email: req.body.email });
        if (userExist) {
            return res.send({
                success: false,
                message: "user already exist",
            });
        }
        // hashing the password

        const salt = await bcrypt.genSalt(10);
        console.log("Password:", req.body.password);
        console.log("Salt:", salt);

        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;

        // save user
        const user = new User(req.body);
        await user.save();


        return res.send({
            success: true,
            message: "User registerd successfully",
        });

    }
    catch (error) {
        return res.send({
            success: false,
            message: error.message,
        });

    }
});



// login user
router.post('/login', async (req, res) => {
    try {
        // check if user exists
        console.log(req.body);
        const { email, password } = req.body;
        console.log('Email:', email, 'password:', password);

        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.send({
                success: false,
                message: "User not found",
            });
        }

        // user type matching as donar, org and hospital
        if (user.userType !== req.body.userType) {
            return res.send({
                success: false,
                message: `user is not registered as a ${req.body.userType}`,
            });
        }



        // Compare passwords
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.send({
                success: false,
                message: "Invalid password",
            });
        }


        // Gen token
        const token = jwt.sign(
            { userId: user._id },
            process.env.jwt_sceret,
            { expiresIn: "1d" }
        );
        return res.send({
            success: true,
            message: "User logged in successfully",
            data: token,
        });
    } catch (error) {
        return res.send({
            success: false,
            message: error.message,
        });
    }
});

// ORGANIZATION LOGIN *******************************************
//get current user
router.get("/get-current-user", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId });

        return res.send({
            success: true,
            message: "User fetched successfully",
            data: user,
        });

    } catch (error) {
        return res.send({
            success: false,
            message: error.message,

        });
    }
});


//get all donars

router.get("/get-all-donars", authMiddleware, async (req, res) => {
    try {
        const organization = new mongoose.Types.ObjectId(req.body.userId);
        const uniqueDonarsIds = await Inventory.distinct("donar", {
            organization,
        });

        const donars = await User.find({
            _id: { $in: uniqueDonarsIds },
        });
        return res.send({
            success: true,
            message: "donars fetched successfully",
            data: donars,
        });

    } catch (error) {
        return res.send({
            success: false,
            message: error.message,
        });

    }
});


//get unique hospitals
router.get("/get-all-hospitals", authMiddleware, async (req, res) => {
    try {
        const organization = new mongoose.Types.ObjectId(req.body.userId);
        const uniqueHospitals = await Inventory.distinct("hospital", {
            organization,
        });
        const hospitals = await User.find({
            _id: { $in: uniqueHospitals },
           
        });
        return res.send({
            success: true,
            messsage: "Hospitals fetched successfully",
            data: hospitals,
        });


    } catch (error) {
        return res.send({
            success: false,
            message: error.message,
        });

    }
});






//DONAR LOGIN *******************************************
//get all unique organization of donar
router.get("/get-all-organization-of-donar", authMiddleware, async (req, res) => {
    try {
        const donar = new mongoose.Types.ObjectId(req.body.userId);
        const uniqueOrganizationIds = await Inventory.distinct("organization", {
            donar,
        });
        const hospitals = await User.find({
            _id: { $in: uniqueOrganizationIds },
           
        });
        return res.send({
            success: true,
            messsage: "hospitals fetched successfully",
            data: hospitals,
        });


    } catch (error) {
        return res.send({
            success: false,
            message: error.message,
        });

    }
});


//Hospital Login
// get all unique hospitals
router.get("/get-all-organization-of-hospital", authMiddleware, async (req, res) => {
    try {
        const hospital = new mongoose.Types.ObjectId(req.body.userId);
        const uniqueOrganizationIds = await Inventory.distinct("organization", {
            hospital,
        });
        const hospitals = await User.find({
            _id: { $in: uniqueOrganizationIds },
           
        });
        //console.log(hospitals)
        return res.send({
            success: true,
            messsage: "Hospitals fetched successfully",
            data: hospitals,
        });


    } catch (error) {
        return res.send({
            success: false,
            message: error.message,
        });

    }
});




module.exports = router;