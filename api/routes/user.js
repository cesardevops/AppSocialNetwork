'use strict'

/*============================================
=            variables y requires            =
============================================*/

var express = require('express');
var UserController = require('../controllers/user');

var api =express.Router();
var md_auth = require('../middlewares/autenticates');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});


/*=====  End of variables y requires  ======*/


/*================================
=            Api User            =
================================*/

api.post('/register',UserController.saveUser);
api.post('/login',UserController.loginUser);
api.get('/user/:id',md_auth.ensureAuth,UserController.getUser);
api.get('/users/:page?',md_auth.ensureAuth,UserController.getUsers);
api.get('/counters/:id?',md_auth.ensureAuth,UserController.getCounters);
api.put('/update-user/:id',md_auth.ensureAuth,UserController.updateUser);
api.post('/upload-image-user/:id',[md_auth.ensureAuth, md_upload],UserController.uploadImage);
api.get('/get-image-user/:imageFile',UserController.getImageFile);


/*=====  End of Api User  ======*/


module.exports = api;