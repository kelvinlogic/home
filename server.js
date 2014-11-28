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

// Our DB object.
global.inMemDatabase = {};

var hierarchiesRt = require('./api/org.hierarchies.api.js');
var menuRt = require('./api/menu.api.js');
var currencyRt = require('./api/currency.api.js');
var instructionRt = require('./api/instruction.api.js');
var uomRt = require('./api/uom.api.js');
var brandRt = require('./api/brand.api.js');
var creditRt = require('./api/credit.card.api.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 4000;

// Enable serving static files.
app.use(express.static(__dirname + '/app'));

// Turn on logging.
app.use(morgan("dev"));

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', [hierarchiesRt, menuRt,currencyRt,instructionRt,uomRt,brandRt,creditRt]);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log("Listening on port " + port);