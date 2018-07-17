'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowSchema = Schema({
	c_user: {type: Schema.ObjectId, ref : 'User'},
	c_followed : {type: Schema.ObjectId, ref : 'User'}
});

module.exports = mongoose.model('Follow' , FollowSchema);