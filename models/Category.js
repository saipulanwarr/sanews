const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    categoryId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean
    },
    createdAt: {
        type: String
    },
    updatedAt: {
        type: String
    }
});

module.exports = Category = mongoose.model('category', CategorySchema);