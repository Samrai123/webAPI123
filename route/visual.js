const { Visual }= require("../model/visual");
const { User }=require("../model/user")
const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyUser = require("../middleware/jwt");
const VisualLike = require("../model/visualLike");


const path = require("path");
const { default: mongoose } = require("mongoose");

router.get("/",verifyUser,(req,res)=>{
    Visual.find({}).select("-password -__v")
    .populate("category", "-__v")
    // .populate("userId","-__v")
    
    .then(
        (visual)=>{
            res.status(200).json({
                success:true,
                message:"List of Visual",
                data: visual
            });
        }

    ).catch(
        (err)=>{
            res.status(500).json({
                success: false,
                message: err,
            });
        }
    );
});
// router.get('/:id',verifyUser,(req,res)=>{
//     Visual.findById(req.params.id)
//     .populate("category", "-__v")
    
//     .then(
//         (visual)=>{
//             res.status(200).json({
//                 success:true,
//                 message:"List of Visual by Id",
//                 data: visual
//             });
//         }

//     ).catch(
//         (err)=>{
//             res.status(500).json({
//                 success: false,
//                 message: err,
//             });
//         }
//     );
// })


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

router.post("/",verifyUser,uploadOptions.single("image"),(req,res)=>{
    // const title = req.body.title;
    // const description = req.body.description;
    // const image = req.file.filename;
    // const userId = req.user._id;

    
    const visual = new Visual({
        description: req.body.description,
        title: req.body.title,
        userId : req.user.userId
    });
    if (req.body.category) {
        visual.category = visual.category.concat(req.body.category)
        
    }
   
    /// add image
    const file =req.file;
    if (file){
        const fileName = req.file.filename;
        visual.image = '/images/user_image/' + fileName;
    }
    visual 
        .save()
        .then((createdVisual)=>{
            res.status(201).json({
                success: true,
                message:"Visual posted successfully",
                data: createdVisual,
                
            });
            
            })
            .catch((err)=>{
                res.status(500).json({
                    success: false,
                    message: err,
                });
        });
})
router.get('/searchVisualByCategory',verifyUser,(req,res)=>{
    const categoryId = req.query.categoryId;
    Visual.find({ category: categoryId })
    .select("-password -__v")
        
        .populate("category", "-__v")
        .then(
            (visual) => {
                res.status(201).json({
                    success: true,
                    message: "List of Visual by category",
                    data: visual,
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
router.post("/:id/toggle-like",verifyUser,async(req,res)=>{
    let visual_id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(visual_id)){
        return res.status(400).send({
            message:'invalid id',
            data:{}
        });
    }
    Visual.findOne({_id:visual_id}).then(async(visual)=>{
        if(!visual){
            res.status(500).send({
                
                message: 'No visual found',
                data:{}
            });
        }else{
            let curent_user=req.user;
            VisualLike.findOne({
                visual_id:visual_id,
                user_id:curent_user._id
            }).then(async(visual_like)=>{
                
                if(!visual_like){
                    
                    let visualLikeDoc = new VisualLike({
                        visual_id:visual_id
                        ,
                        user_id:curent_user._id
                    });
                    let likeData = await visualLikeDoc.save();
                    await Visual.updateOne({
                        _id:visual_id
                    },{
                        $push:{like:likeData._id}
                    })
                    res.status(201).json({
                        success: true,
                        message: "Like added",
                        data: {},
                    });
                }else{
                    await VisualLike.deleteOne({
                        _id:visual_like._id
                    });
                    await Visual.updateOne({
                        _id:visual_like.visual_id
                    },{
                        $pull:{like:visual_like._id}
                    })
                    res.status(201).json({
                        success: true,
                        message: "Like removed",
                        data: {},
                    });
                }

            }).catch((err)=>{
                return res.status(400).send({
                    message:err.message,
                    data:err
                })
            })

        }
    }).catch((err)=>{
        return res.status(400).send({
            message:err.message,
            data:err
        })
    })
})

router.post('/:id/comment',(req,res,next)=>{
    console.log(req.user)
    req.body.reviewer=req.user.userId
    Visual.findById(req.params.id)
    .then((visual)=>{
        visual.comments.push(req.body)
        visual.save().then(b=>res.json(b.comments))
    }).catch(next)
})
router.get('/:id/comment',(req,res)=>{
    Visual.findById(req.params.id)
    .then((visual)=>{
        res.json(visual.comments)
    })
})

router.put("/update/:id",(req,res)=>{
    const title=req.body.title;
    const description = req.body.description;
    
    Visual.updateOne({
        _id:req.params.id
    },{title:title,
    description:description,
    
    })
    .then(()=>{
        res.json({msg:"Updated"})
    })
    .catch((e)=>{
        res.json({msg:"error"})
    })
})


router.delete("/:id",verifyUser,(req,res)=>{
 Visual.deleteOne({_id:req.params.id})
    .then(()=>{
        res.json({success:true,message:"delete"})
    })
    .catch((e)=>{
        res.json({success:false,message:"error"})
    })
})
module.exports = router;