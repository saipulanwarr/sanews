const uuidv4 = require('uuid/v4');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');
const wrapper = require('../../helpers/wrapper');

const validateRegisterInput = require('../../validator/register');

// @route POST api/users
// @desc Register user
// @access Public
router.post('/', async(req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);

    if(!isValid){
        return wrapper.response(res, 'fail', null, errors, 400);
    }

    const { name, email, password } = req.body;

    try{
        let user = await User.findOne({ email: email });

        if(user){
            return wrapper.response(res, 'fail', null, 'User already exists', 400);
        }

        user = new User({
            userId: uuidv4(),
            name,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

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
                wrapper.response(res, 'success', token, 'Register is successfuly', 200);
            }
        )
    }catch(err){
        console.log(err.message);
        return wrapper.response(res, 'fail', null, 'Server error', 500);
    }
});

module.exports = router;