const jwt = require('jsonwebtoken');
const config = require('config');
const wrapper = require('../helpers/wrapper');

module.exports = function(req, res, next){
    //Get token from header
    const token = req.header('x-auth-token');

    //Check if not token
    if(!token){
        return wrapper.response(res, 'fail', null, 'No token, authorization denied', 401);
    }

    // Verify token
    try{
        const decode = jwt.verify(token, config.get('jwtSecret'));

        req.user = decode.user;
        next();
    }catch(err){
        wrapper.response(res, 'fail', null, 'Token is not valid', 401);
    }
}