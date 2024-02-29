const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const jwt = require("jsonwebtoken");


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
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.send({
                success: false,
                message: "User not found",
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
            process.env.jwt_secret,
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


module.exports = router;