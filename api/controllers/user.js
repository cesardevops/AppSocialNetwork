/*===========================================
=            variables e imports            =
===========================================*/

'use strict'
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

var User = require('../models/user');
var Follow = require('../models/follow');
var jwt = require('../services/jwt');


/*=====  End of variables e imports  ======*/


/*============================================
=            Registro de Usuarios            =
============================================*/

function saveUser(req,res){
	var params = req.body;
	var user = new User();

	if(params.name && params.surname && params.nick && params.email && params.password){
		user.c_name = params.name;
		user.c_surname = params.surname;
		user.c_nick = params.nick;
		user.c_email = params.email;
		user.c_role = 'ROLE_USER';
		user.c_image = null;

		// controlar usuarios duplicados
		User.find({$or: [
			{c_email:user.c_email.toLowerCase()},
			{c_nick: user.c_nick.toLowerCase()}

		]}).exec((err, users)=>{
			if(err) return res.status(500).send({message: 'error la peticion de usuarios'});

			if(users && users.length >= 1)
			{
				return res.status(200).send({message: 'El usuario ya existe intente con otro'});
			}else {
				// cifrado y guardado de datos
				bcrypt.hash(params.password, null, null,(err, hash)=>{
					user.c_password = hash;
					user.save((err ,userStored)=>{
						if(err) return res.status(500).send({message: 'error al guardar el usuario'});

						if(userStored){
							res.status(200).send({user, userStored});
						}else{
							res.status(404).send({message: 'no se registrado el usuario'});
						}
					});
				});
			}
		});


	}
	else
	{
		res.status(200).send({
			message : 'No se completaron los campos'
		});
	}
}

/*=========================================
=            Login de usuarios            =
=========================================*/


function loginUser(req, res){
	var params = req.body;

	var email = params.email;
	var password = params.password;

	User.findOne({c_email:email}, (err, user)=> {
		if(err) return res.status(500).send({message:'Error en la peticion'});

		if(user){
			bcrypt.compare(password, user.c_password, (err , check)=>{
				if(check){
					// devolver datos de usuario
					if (params.gettoken) {
						// generar y devolver un token
						return res.status(200).send({
							token: jwt.createToken(user)
						})
					}
					else{
						user.c_password = undefined;
						return res.status(200).send({user});
					}
				}else{
					return res.status(404).send({message:'Error de identificacion'});
				}
			});
		}else{
			return res.status(404).send({message:'Error de identificacion !'});
		}
	});

}

/*===================================================
=            Obtener datos de un usuario            =
===================================================*/

function getUser(req,res){
	var userId =req.params.id;
	User.findById(userId, (err,user)=>{
		if (err) { return res.status(500).send({menssage: 'error de peticion'});}
		if (!user) { return res.status(404).send({menssage: 'el usuario no existe'});}
		
		user.c_password = undefined;

		/*Follow.findOne({"c_user":req.user.sub,"c_followed":userId}).exec((err, follow)=>{
			if(err) { return res.status(500).send({menssage: 'error al comprobar el seguimiento'});}
			return res.status(200).send({user,follow})
		});*/

		followThisUser(req.user.sub, userId).then((response)=>{
			return res.status(200).send({
				user: user,
				//response: response,
				following: response.following, 
				followed: response.followed
			});
		}).catch(err => {
			console.error('fetch failed', err);
		});
	});
}

async function followThisUser(identity_user_id, user_id) {
    try {
        var following = await Follow.findOne({ c_user: identity_user_id, c_followed: user_id }).exec()
            .then((following) => {
                return following;
            })
            .catch((err) => {
                return handleError(err);
            });
        var followed = await Follow.findOne({ c_user: user_id, c_followed: identity_user_id }).exec()
            .then((followed) => {
                return followed;
            })
            .catch((err) => {
                return handleError(err);
            });
        return {
            following: following,
            followed: followed
        }
    } catch (e) {
        console.log(e);
    }
}
/*========================================================================
=            Obtener listado de usuarios en formato de pagina            =
========================================================================*/

function getUsers(req,res){
	var identity_user_id = req.user.sub;
	var page = 1;
	if (req.params.page) {
		page = req.params.page;
	}

	var itemsPerPage = 5;

	User.find().sort('_id').paginate(page, itemsPerPage, (err,users, total) =>{
		if (err) { return res.status(500).send({menssage: 'error de peticion'});}
		if (!users) { return res.status(404).send({menssage: 'no hay usuarios disponibles'});}
		
		followsUserIds(identity_user_id).then((value)=>{
			return res.status(200).send({
				users:users,
				users_following : value.following,
				users_followMe : value.followed,
				total:total,
				page:Math.ceil(total / itemsPerPage)

			});
		});

	});
}
async function followsUserIds(userId){
	/*var following = await Follow.find({c_user:userId}).select({'_id' :0 , '__v':0, 'c_user':0}).exec((error, follows) =>{
		var follows_clean =[];

		follows.forEach((follow) =>{
			console.log(follow.c_followed);
			follows_clean.push(follow.c_followed);
		});

		return follows_clean;
	});
	var followed = await Follow.find({c_followed:userId}).select({'_id' :0 , '__v':0, 'c_followed':0}).exec((error, follows) =>{
		var follows_clean =[];

		follows.forEach((follow) =>{
			console.log(follow.c_user);
			follows_clean.push(follow.c_user);
		});

		return follows_clean;
	});

	return {
		following : following,
		followed: followed
	}*/
    try {
        var following = await Follow.find({ c_user: userId }).select({'_id' :0 , '__v':0, 'c_user':0}).exec()
            .then((following) => {
                return following;
            })
            .catch((err) => {
                return handleError(err);
            });
        var followed = await Follow.find({ c_followed:userId }).select({'_id' :0 , '__v':0, 'c_followed':0}).exec()
            .then((followed) => {
                return followed;
            })
            .catch((err) => {
                return handleError(err);
            });

        var following_clean = [];
        following.forEach( (value)=> {
        	// statements
        	following_clean.push(value.c_followed);
        });
        
        var followed_clean = [];
        followed.forEach( (value) =>{
        	followed_clean.push(value.c_user);
        });

        return {
            following: following_clean,
            followed: followed_clean
        }
    } catch (e) {
        console.log(e);
    }
}

/*======================================================================
=            Contador de seguidores y personas que seguimos            =
======================================================================*/

function getCounters(req,res){
	var userId = req.user.sub;

	if(req.params.id){
		userId = req.params.id;
	}
	getCountFollow(userId)
		.then((response)=>{
			return res.status(200).send(response);
		})
		.catch((error)=>{
			return handleError(error);
		});
}

async function getCountFollow(userId)
{
	var following = await Follow.count({c_user:userId}).exec()
		.then((response)=>{
			return response;
		}).catch((error)=>{
			return handleError(error);
		});
	var followed = await Follow.count({c_followed:userId}).exec()
		.then((response)=>{
			return response;
		}).catch((error)=>{
			return handleError(error);
		});

	return {
		following : following,
		followed : followed
	}
}


/*=====  End of Contador de seguidores y personas que seguimos  ======*/

/*===================================================
=            Edicion de datos de usuario            =
===================================================*/

function updateUser(req,res)
{
	var userId = req.params.id;
	var update = req.body;

	/* borrar propiedad password */
	delete update.password;

	if (userId != req.user.sub) {
		return res.status(500).send({menssage:'no tienes permiso para actualizar los datos del usuario'});
	}

	User.findByIdAndUpdate(userId, update,{new:true} , (err,userUpdated) =>{
		if (err) { return res.status(500).send({menssage: 'error de peticion'});}

		if (!userUpdated) { return res.status(404).send({menssage: 'no se ha podido actualizar el usuario'});}

		return res.status(200).send({user: userUpdated});
	});
	
}

/*========================================================
=            Subir imagen como foto de perfil            =
========================================================*/


function uploadImage(req,res)
{
	var userId = req.params.id;

	if (req.files) {
		var file_path = req.files.image.path;
		//console.log(file_path);
		var file_split = file_path.split('\\');
		//console.log(file_split);

		var file_name = file_split[2];

		var ext_split = file_name.split('\.');

		var file_ext = ext_split[1];

		if (userId != req.user.sub) {
			return removeFilesOfUploads(res, file_path , 'No tienes permiso para actualizar los datos del usuario');
		}

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif')
		{
			/* actualizar documento de usuario logueado */
			//return res.status(200).send({message:'imagen valida'});
			User.findByIdAndUpdate(userId, {c_image: file_name},{new:true}, (err, userUpdated) => {
				
				if (err) { return res.status(500).send({menssage: 'error de peticion'});}
				if (!userUpdated) { return res.status(404).send({menssage: 'no se ha podido actualizar el usuario'});}
				return res.status(200).send({user: userUpdated});

			});
			
		}else {
			return removeFilesOfUploads(res,file_path , 'Extencion no valida');
		}
	}
	else
	{
		return res.status(200).send({message:'no se ha subido imagen'});
	}
}

/*----------  Remover la imagen de memoria  ----------*/

function removeFilesOfUploads(res, file_path, message_)
{
	fs.unlink(file_path, (err) =>{
		return res.status(200).send({message:message_});
	});	
}

/*----------  Obtener la imagen de perfil del usuario  ----------*/

function getImageFile(req, res)
{
	var image_file = req.params.imageFile;
	var path_file = './uploads/users/' + image_file;
	fs.exists(path_file, (exists)=>{
		if (exists) {
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({menssage:'no existe la imagen'});
		}
	});
}


/**
	TODO:
	- Metodos que son controlados por el api
 */

module.exports = {
	saveUser,
	loginUser,
	getUser,
	getUsers,
	getCounters,
	updateUser,
	uploadImage,
	getImageFile
}