'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
	c_name: String,
	c_surname: String,
	c_nick: String,
	c_email: String,
	c_password :String,
	c_role: String,
	c_image: String
});

module.exports = mongoose.model('User', UserSchema);