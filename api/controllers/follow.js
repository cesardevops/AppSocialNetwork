'use strict'

/*============================================
=            Variables y requires            =
============================================*/

//var path = require('path');
//var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');


/*=====  End of Variables y requires  ======*/


/*======================================
=            seguir usuario            =
======================================*/

function saveFollow(req,res)
{
	var params = req.body;
	var follow = new Follow();
	follow.c_user = req.user.sub;
	follow.c_followed = params.followed;

	follow.save((err, followStored)=>{
		if (err) { return res.status(500).send({message: 'Error al guardar el seguiemietio'});}

		if (!followStored) {return res.status(404).send({message:'el seguimietnot no se ha guardado'});}

		return res.status(200).send({follow:followStored});
	});
}


/*=====  End of seguir usuario  ======*/


/*========================================
=            dejar de seguir             =
========================================*/

function deleteFollow(req,res){

	var userId = req.user.sub;
	var folloewd = req.params.id;

	Follow.find({'c_user': userId,'c_followed': folloewd}).remove( err =>{
		if (err) { return res.status(500).send({message: 'Error al dejar de seguir'});}

		return res.status(200).send({message: 'El follow se ha eliminado!'});
	});
}

/*=====  End of dejar de seguir   ======*/


/*========================================================
=            Obtener a alos usuarios que sigo            =
========================================================*/



function getFollowingUsers(req,res){

	var userId = req.user.sub;

	if(req.params.id && req.params.page){
		userId = req.params.id;
	}

	var page = 1;

	if (req.params.page) {
		page = req.params.page;
	}
	else
	{
		page = req.params.id;
	}

	var itemsPerPage = 4;

	Follow.find({c_user:userId}).populate({path: 'c_followed'}).paginate(page,itemsPerPage,(err,follows,total) =>{
		if (err) { return res.status(500).send({message: 'Error en el servidor'});}

		if(!follows) {return res.status(404).send({message:"no estas siguiendo a ningun usuario"});}

		return res.status(200).send({
			total: total,
			pages:Math.ceil(total/itemsPerPage),
			follows
		});
	})
}


/*=====  End of Obtener a alos usuarios que sigo  ======*/


/*=====================================================
=            OBtener lsitado de seguidores            =
=====================================================*/

function getFollowedUSers(req,res){

	var userId = req.user.sub;

	if(req.params.id && req.params.page){
		userId = req.params.id;
	}

	var page = 1;

	if (req.params.page) {
		page = req.params.page;
	}
	else
	{
		page = req.params.id;
	}

	var itemsPerPage = 4;

	Follow.find({c_followed:userId}).populate('c_user c_followed').paginate(page,itemsPerPage,(err,follows,total) =>{
		if (err) { return res.status(500).send({message: 'Error en el servidor'});}

		if(!follows) {return res.status(404).send({message:"no te sigue ningun usuario"});}

		return res.status(200).send({
			total: total,
			pages:Math.ceil(total/itemsPerPage),
			follows
		});
	})
}

/*=====  End of OBtener lsitado de seguidores  ======*/

/*=========================================================
=            listado de seguidores sin paginar            =
=========================================================*/


function getMyFollows(req,res)
{
	var userId = req.user.sub;
	var find = Follow.find({c_user: userId}); // usuarios que estoy siguiendo
	if(req.params.followed)
	{
		find = Follow.find({c_followed: userId}) //los usuarios que me estan siguiendo
	}

	find.populate('c_user c_followed').exec((err,follows)=>{
		if (err) { return res.status(500).send({message: 'Error en el servidor'});}

		if(!follows) {return res.status(404).send({message:"no sigues a ningun usuario"});}

		return res.status(200).send({
			follows
		});
	})
}


/*=====  End of listado de seguidores sin paginar  ======*/

/**
	TODO:
	- Metodos que son controlados por el api
 */

module.exports ={
	saveFollow,
	deleteFollow,
	getFollowingUsers,
	getFollowedUSers,
	getMyFollows
}