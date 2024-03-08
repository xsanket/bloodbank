const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const jwt = require("jsonwebtoken");
const authMiddleware = require('../middlewares/authMiddleware');


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


//get current user
router.get("/get-current-user", authMiddleware, async (req, res)=>{
    try {
        const user = await User.findOne({ _id: req.body.userId});
     
        return res.send({
            success:true,
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

// router.get("/get-current-user", authMiddleware, async (req, res) => {
//     try {
//       if (!req.session.token) {
//         return res.send({
//           success: false,
//           message: "User needs to log in",
//         });
//       }
  
//       const user = await User.findOne({ _id: req.body.userId });
  
//       return res.send({
//         success: true,
//         message: "User fetched successfully",
//         data: user,
//       });
//     } catch (error) {
        
//       return res.send({
//         success: false,
        
//         message: error.message,
//       });
//     }
//   });








module.exports = router;