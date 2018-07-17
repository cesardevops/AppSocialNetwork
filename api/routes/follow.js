'use strict'

var express = require('express');
var FollowController = require('../controllers/follow');
var api = express.Router();
var md_Auth =require('../middlewares/autenticates');

api.post('/follow', md_Auth.ensureAuth,FollowController.saveFollow);
api.delete('/unfollow/:id',md_Auth.ensureAuth,FollowController.deleteFollow);
api.get('/following/:id?/:page?',md_Auth.ensureAuth, FollowController.getFollowingUsers);
api.get('/followed/:id?/:page?',md_Auth.ensureAuth, FollowController.getFollowedUSers);
api.get('/get-my-follows/:followed?',md_Auth.ensureAuth, FollowController.getMyFollows);

module.exports= api;