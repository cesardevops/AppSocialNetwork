'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PublicationSchema = Schema({
	c_text: String,
	c_file: String,
	c_crated_At: String,
	c_user: {type:Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Publication', PublicationSchema);