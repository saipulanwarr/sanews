const uuid = require('uuid/v4');
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const wrapper = require('../../helpers/wrapper');

const Category = require('../../models/Category');
const validateCategoryInput = require('../../validator/category');

// @route   POST api/category
// @desc    Create category
// @access  Private
router.post('/', auth, async(req, res) => {
    const { errors, isValid } = validateCategoryInput(req.body);

    if(!isValid){
        return wrapper.response(res, 'fail', null, errors, 400);
    }

    try{
        const newCategory = new Category({
            categoryId: uuid(),
            name: req.body.name,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: null
        });

        const category = await newCategory.save();

        return wrapper.response(res, 'success', category, 'category is successfuly created', 200);
    }catch(err){
        console.log(err.message);;
        wrapper.response(res, 'fail', null, 'Server Error', 500);
    }
});

// @route   GET api/category?page=1&size=10
// @desc    get list category
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
        const categories = await Category.find({ isDeleted: false }).sort({ _id: -1 }).limit(payload.size).skip(payload.page);

        if(categories == ''){
            return wrapper.response(res, 'fail', null, 'category not found', 404);
        }

        const countData = await Category.find({ isDeleted: false }).count();

        const metaData = {
            page: parseInt(req.query.page),
            size: payload.size,
            totalPage: Math.ceil(countData / payload.size),
            totalData: countData
        };

        return wrapper.paginationResponse(res, 'success', categories, metaData, 'list of categories', 200);
    }catch(err){
        console.log(err.message);
        wrapper.response(res, 'fail', null, 'Server Error', 500);
    }
});

// @route   GET api/category/:categoryId
// @desc    GET detail category
// @access  Private
router.get('/:categoryId', auth, async(req, res) => {
    try{
        const category = await Category.findOne({ categoryId: req.params.categoryId, isDeleted: false });

        if(!category){
            return wrapper.response(res, 'fail', null, 'category not found', 404);
        }

        return wrapper.response(res, 'success', category, 'detail category', 200);
    }catch(err){
        console.log(err.message);
        return wrapper.response(res, 'fail', null, 'Server Error', 500);
    }
});

// @route   UPDATE api/category/:categoryId
// @desc    Update category
// @access  Private
router.put('/:categoryId', auth, async(req, res) => {
    const { errors, isValid } = validateCategoryInput(req.body);

    if(!isValid){
        return wrapper.response(res, 'fail', null, errors, 400);
    }

    try{
        const categoryId = req.params.categoryId;
        const name = req.body.name;
        
        let category = await Category.findOne({ categoryId: categoryId, isDeleted: false });

        if(!category){
            return wrapper.response(res, 'fail', null, 'category not found', 404);
        }

        const categoryFields = {};
        categoryFields.categoryId = categoryId;
        if(name) categoryFields.name = name;
        categoryFields.isDeleted = category.isDeleted;
        categoryFields.createdAt = category.createdAt;
        categoryFields.updatedAt = new Date().toISOString();

        category = await Category.findOneAndUpdate({ categoryId: categoryId }, { $set: categoryFields }, { new: true });

        return wrapper.response(res, 'success', category, 'category is successfuly updated', 200);
    }catch(err){
        console.log(err.message);
        return wrapper.response(res, 'fail', null, 'Server Error', 500);
    }
});

// @route   DELETE api/category/:categoryId
// @desc    DELETE category
// @access  Private
router.delete('/:categoryId', auth, async(req, res) => {
    const categoryId = req.params.categoryId;

    try{
        let category = await Category.findOne({ categoryId: categoryId, isDeleted: false });

        if(!category){
            return wrapper.response(res, 'fail', null, 'category not found', 404);
        }

        const categoryFields = {};
        categoryFields.categoryId = categoryId;
        categoryFields.name = category.name;
        categoryFields.isDeleted = true;
        categoryFields.createdAt = category.createdAt;
        categoryFields.updatedAt = new Date().toISOString();

        category = await Category.findOneAndUpdate({ categoryId: categoryId }, { $set: categoryFields }, { new: true });

        return wrapper.response(res, 'success', null, 'category is successfuly deleted', 200);
    }catch(err){
        console.log(err.message);
        return wrapper.response(res, 'fail', null, 'Server Error', 500);
    }
})

module.exports = router;