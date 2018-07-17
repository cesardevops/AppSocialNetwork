'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = Schema({

	c_text: String,
	c_created_At: String,
	c_emiter : {type: Schema.ObjectId, ref: 'User'},
	c_receiver: {type: Schema.ObjectId, ref: 'User'}
});

module.exports =  mongoose.model('Message', MessageSchema);