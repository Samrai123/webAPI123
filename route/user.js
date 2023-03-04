const {  User } = require("../model/user");
const { Category } = require("../model/category");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const verifyUser = require('../middleware/jwt');
const { verify } = require("crypto");

// get all student with bearer token
router.get("/",verifyUser, (req, res) => {
    User.find({}).select("-password -__v")
        
        .populate("category", "-__v")
        .then(
            (user) => {
                res.status(200).json({
                    success: true,
                    message: "List of Users",
                    data: user,
                });
            }
        ).catch(
            (err) => {
                res.status(500).json({
                    success: false,
                    message: err,
                });
            }
        ); 
});

// router.get("/:id",verifyUser,(req,res)=>{
//     User.findById(req.params.id)
//     .populate("category", "-__v")
//     .then(
//         (user) => {
//             res.status(200).json({
//                 success: true,
//                 message: "List of Users",
//                 data: user,
//             });
//         }
//     ).catch(
//         (err) => {
//             res.status(500).json({
//                 success: false,
//                 message: err,
//             });
//         })
// })

// Search user by categoryid from category array
router.get('/searchUserByCategory', verifyUser, (req, res) => {
    const categoryId = req.query.categoryId;
    User.find({ category: categoryId })
        .select("-password -__v")
        
        .populate("category", "-__v")
        .then(
            (user) => {
                res.status(201).json({
                    success: true,
                    message: "List of User by category",
                    data: user,
                });
            }
        ).catch(
            (err) => {
                res.status(500).json({
                    success: false,
                    message: err,
                });
            }
        ); 
});


//Validate upload file
const FILE_TYPE_MAP = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/jpg": "jpg",
};

//Upload image to server
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        //validate weather the file is a valid image
        if (!isValid) cb(new Error("Invalid file type"), "./images/user_image");
        else cb(null, "./images/user_image"); // path where we upload an image
    },
    filename: function (req, file, cb) {
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `IMG-${Date.now()}.${extension}`);
    },
});

var uploadOptions = multer({ storage: storage });
// Register user
router.post("/", uploadOptions.single("image"), (req, res) => {
    const user = new User({
        fname: req.body.fname,
        lname: req.body.lname,
        email:req.body.email,
        username:req.body.username,
        password: bcrypt.hashSync(req.body.password, 10),
    });


    // Add category array to user object
    if (req.body.category) {
        user.category = user.category.concat(req.body.category)
        
    }
  

    // Add image to user
    const file = req.file;
    if (file) {
        const fileName = req.file.filename;
        user.image = '/images/user_image/' + fileName;
    }

    user
        .save()
        .then((createdUser) => {
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: createdUser,
                
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: err,
            });
        });
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    const secretKey = process.env.SECRET_KEY;
    if (user) {
        // dont use bcryptjs
        if (bcrypt.compareSync(req.body.password, user.password)) {
            // create a token
            const token = jwt.sign(
                {
                    email: user.email,
                    fname: user.fname,
                    lname: user.lname,
                    image: user.image,
                    userId:user._id

                                       
                },
                secretKey,
                {
                    expiresIn: "1d",
                }
            );
            

            res.json({
                success: true,
                message: "Logged in successfully",
                token: token,
                email: user.email,
                
               
                
            });
        } else {
            res
                .status(401)
                .json({
                    success: false,
                    message: "Invalid username or password",
                });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
});

router.delete("/:id", (req, res) => {

    User.findByIdAndDelete(req.params.id)
        .then(user => {
            if (user != null) {
                var path = path.join(__dirname, "..", user.image);
                fs.unlink(path2, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    res.status(200).json({
                        success: true,
                        message: "User deleted successfully",
                    });
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "User not found",
                });
            }
        })
        .catch(err => { 
            res.status(500).json({
                success: false,
                message: err.message,
            });

        });
});
router.get("/profile",verifyUser,(req,res)=>{
    
    
    console.log(req.user)
    res.json({email: req.user.email,fname:req.user.fname,lname:req.user.lname,image:req.user.image})
    
    
})

module.exports = router;