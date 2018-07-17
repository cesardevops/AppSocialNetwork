'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;


//conexion database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/db_dev_social_network', { useMongoClient: true})
	.then(() => {
		console.log('@Hello://~La conexion a la base de datos db_dev_social_network se ha realizado');
	
		// crear servidor
		app.listen(port, () => {
			console.log('Servidor en ejecucion http://localhost:3800');	
		});
	})
	.catch(err => console.log(err));