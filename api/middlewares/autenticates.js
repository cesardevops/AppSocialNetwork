'use stricts'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_ultra_Secreta_di:%%%%_ok_google_!'

exports.ensureAuth = function(req,res,next){
	if (!req.headers.authorization) {
		return res.status(403).send({message: 'la peticion no tiene la cabecera de autentificacion'});

	}

	var token = req.headers.authorization.replace(/['"]+/g, '');

	try {
		// statements
		var payload = jwt.decode(token, secret);

		if (payload.exp<= moment().unix()) {
			return res.status(401).send({message:'el token ha expirado'});
		}
	} catch(e) {
		// statements
		console.log(e);
		return res.status(404).send({message:'el token no es valido'});

	}

	req.user = payload;

	next();

}