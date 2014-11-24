/**
 * Created by Caleb on 11/15/2014.
 */
// BASE SETUP
// =============================================================================

// call the packages we need
var express     = require('express'); 		// call express
var app         = express(); 				// define our app using express
var morgan      = require('morgan');
var bodyParser  = require('body-parser');
var _           = require('lodash');

var hierarchiesRt = require('./api/org.hierarchies.api.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 4000;

// Turn on logging.
app.use(morgan("dev"));

// Enable serving static files.
app.use(express.static(__dirname + '/app'));

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', [hierarchiesRt]);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log("Listening on port " + port);