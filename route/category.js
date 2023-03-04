const { Category } = require("../model/category");
const express = require("express");
const verifyUser = require("../middleware/jwt");
const router = express.Router();

// get all category
router.get("/", (req, res) => {
    return Category.find({}).then(
        (category) => {
            res.status(200).json({
                success: true,
                message: "List of category",
                data: category,
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

// Add course
router.post("/", (req, res) => {
    const category = new Category({
        categoryName: req.body.categoryName,
    });
    category.save().then(
        (category) => {
            res.status(200).json({
                success: true,
                message: "Category added successfully",
                data: category,
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
router.delete("/:id",(req,res)=>{
    Category.deleteOne({_id:req.params.id})
    .then(()=>{
        res.json({success:true,message:"delete"})
    })
    .catch((e)=>{
        res.json({success:false,message:"error"})
    })
})
router.put("/update/:id",(req,res)=>{
    const categoryName= req.body.categoryName;
    Category.updateOne(
        {_id:req.params.id},
        {
            categoryName:categoryName,
        }).then(()=>{
            res.json({msg:"Updated"})
        }).catch((e)=>{
            res.json({msg:"Error"})
        })
    
})

module.exports = router;