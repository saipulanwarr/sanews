const uuid = require('uuid/v4');
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const wrapper = require('../../helpers/wrapper');

const News = require('../../models/News');
const Category = require('../../models/Category');
const validateNewsInput = require('../../validator/news');

// @route   POST api/news
// @desc    Create a news
// @access  Private
router.post('/', auth, async (req, res) => {
    const {errors, isValid} = validateNewsInput(req.body);

    if(!isValid){
        return wrapper.response(res, 'fail', null, errors, 400);
    }

    try{
        const payload = {
            ...req.body
        };

        const category = await Category.findOne({ categoryId: payload.categoryId });

        if(!category){
            return wrapper.response(res, 'fail', null, 'category not found', 404);
        }

        const newNews = new News({
            categoryId: payload.categoryId,
            newsId: uuid(),
            title: payload.title,
            image: payload.image,
            description: payload.description,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: null
        });

        const news = await newNews.save();

        return wrapper.response(res, 'success', news, 'news is successfuly created', 200);
    }catch(err){
        console.log(err.message);
        wrapper.response(res, 'fail', null, 'Server Error', 500);
    }
});

// @route   GET api/news
// @desc    get list news
// @access  Private
router.get('/', auth, async(req, res) => {
    let payload;

    payload = {
        ...req.query
    };

    if(payload.page == 0){
        return wrapper.response(res, 'fail', null, 'page not allow 0', 400);
    }

    payload.page = parseInt(payload.page) || 1;
    payload.size = parseInt(payload.size) || 10;

    payload.page = payload.size * (payload.page - 1);

    try{
       const news = await News.find({ isDeleted: false }).sort({ _id: -1 }).limit(payload.size).skip(payload.page);

       if(news == ''){
           return wrapper.response(res, 'fail', null, 'news not found', 404);
       }

       const countData = await News.find({ isDeleted: false }).count();

       const metaData = {
           page: parseInt(req.query.page),
           size: payload.size,
           totalPage: Math.ceil(countData / payload.size),
           totalData: countData
       };

       return wrapper.paginationResponse(res, 'success', news, metaData, 'list of news', 200);
       
    }catch(err){
        console.log(err.message);
        wrapper.response(res, 'fail', null, 'Server Error', 500);
    }
});

// @route   GET api/news/:newsId
// @desc    GET detail news
// @access  Private
router.get('/:newsId', auth, async(req, res) => {
    const newsId = req.params.newsId;
    try{
        const news = await News.findOne({ newsId: newsId, isDeleted: false });

        if(!news){
            return wrapper.response(res, 'fail', null, 'news not found', 404);
        }

        return wrapper.response(res, 'success', news, 'detail news', 200);
    }catch(err){
        console.log(err.message);
        return wrapper.response(res, 'fail', null, 'Server Error', 500);
    }
})

// @route   UPDATE api/news
// @desc    update news
// @access  Private
router.put('/:newsId', auth, async (req, res) => {
    const {errors, isValid} = validateNewsInput(req.body);
    
    if(!isValid){
        return wrapper.response(res, 'fail', null, errors, 400);
    }

    try{
        const payload = {
            ...req.body,
            ...req.params
        };

        let news = await News.findOne({ newsId: payload.newsId, isDeleted: false });

        if(!news){
            return wrapper.response(res, 'fail', null, 'news not found', 404);
        }

        let category = await News.findOne({ categoryId: payload.categoryId, isDeleted: false });

        if(!category){
            return wrapper.response(res, 'fail', null, 'category not found', 404);
        }

        const newsFields = {};
        newsFields.categoryId = payload.categoryId;
        newsFields.newsId = payload.newsId;
        if(payload.title) newsFields.title = payload.title;
        if(payload.image) newsFields.image = payload.image;
        if(payload.description) newsFields.description = payload.description;
        newsFields.isDeleted = news.isDeleted;
        newsFields.createdAt = news.createdAt;
        newsFields.updatedAt = new Date().toISOString();

        news = await News.findOneAndUpdate({ newsId: payload.newsId }, { $set: newsFields }, { new: true });

        return wrapper.response(res, 'success', news, 'news is successfuly updated', 200);

    }catch(err){
        console.log(err.message);
        return wrapper.response(res, 'fail', null, 'Server Error', 500);
    }
});

// @route   DELETE api/news/:newsId
// @desc    DELETE news
// @access  Private
router.delete('/:newsId', auth, async(req, res) => {
    const newsId = req.params.newsId;

    try{
        let news = await News.findOne({ newsId: newsId, isDeleted: false });

        if(!news){
            return wrapper.response(res, 'fail', null, 'news not found', 404);
        }

        const newsFields = {};
        newsFields.categoryId = news.categoryId;
        newsFields.newsId = news.newsId;
        newsFields.title = news.title;
        newsFields.image = news.image;
        newsFields.description = news.description;
        newsFields.isDeleted = true;
        newsFields.createdAt = news.createdAt;
        newsFields.updatedAt = new Date().toISOString();

        news = await News.findOneAndUpdate({ newsId: newsId }, { $set: newsFields }, { new: true });

        return wrapper.response(res, 'success', null, 'news is successfuly deleted', 200);

    }catch(err){
        console.log(err.message);
        return wrapper.response(res, 'fail', null, 'Server Error', 500);
    }
})

module.exports = router;
