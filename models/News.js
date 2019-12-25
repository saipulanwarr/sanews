const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NewsSchema = new Schema({
    categoryId: {
        type: String,
        ref: 'category'
    },
    newsId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    description: {
        type: String
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

module.exports = News = mongoose.model('news', NewsSchema);