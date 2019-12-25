const express = require('express');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const wrapper = require('../../helpers/wrapper');
const User = require('../../models/User');

const validateLoginInput = require('../../validator/login');

// @route   GET api/auth
// @desc    get auth
// @access  Private
router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        wrapper.response(res, 'success', user, 'profile user', 200);
    }catch(err){
        console.log(err.message);
        wrapper.response(res, 'fail', null, 'Server Error', 500);
    }
});

// @route   api/auth
// @desc    Authenticate user & get token
// @access  Private
router.post('/', async (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    if(!isValid){
        return wrapper.response(res, 'fail', null, errors, 400);
    }

    const { email, password } = req.body;

    try{
        let user = await User.findOne({ email: email });
        if(!user){
            return wrapper.response(res, 'fail', null, 'Invalid Credentials', 400);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return wrapper.response(res, 'fail', null, 'Invalid Credentials', 400);
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 36000 },
            (err, token) => {
                if(err) throw err;
                wrapper.response(res, 'success', token, 'login is successfully', 200);
            }
        )
    }catch(err){
        console.log(err.message);
        wrapper.response(res, 'fail', null, 'Server Error', 500);
    }
});

module.exports = router;