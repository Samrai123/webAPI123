const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        trim: true,
    },
});

exports.Category = mongoose.model("Category", categorySchema);