'use strict'

var jwt = require('jwt-simple');
var moment =require('moment');
var secret = 'clave_ultra_Secreta_di:%%%%_ok_google_!'


exports.createToken = function(user){
	var payload = {
		sub: user._id,
		name: user.c_name,
		nick: user.c_nick,
		email: user.c_email,
		role: user.c_role,
		image: user.c_image,
		iat: moment().unix(),
		exp:moment().add(30,'days').unix
	};


	return jwt.encode(payload, secret );
};