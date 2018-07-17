'use strict'

var express = require('express');
var PublicationController = require('../controllers/publication');

var api = express.Router();
var md_Auth =require('../middlewares/autenticates');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/publications'});

api.get('/probando-pub',md_Auth.ensureAuth,PublicationController.probando);

module.exports = api;