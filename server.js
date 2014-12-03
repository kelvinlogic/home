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

var menuRt = require('./api/menu.api.js');
var orgHierarchiesRt = require('./api/org.hierarchies.api.js');
var prodHierarchiesRt = require('./api/prod.hierarchies.api.js');

// Njuguna's merge
var supplierRt = require('./api/supplier.api.js');
var servingRt = require('./api/serving_uom.api.js');
var reasonsRt = require('./api/reasons.api.js');
var vatRt = require('./api/vat.master.api.js');
var salesmanRt= require('./api/salesman.api.js');

// Kelvin's merge
var currencyRt = require('./api/currency.api.js');
var instructionRt = require('./api/instruction.api.js');
var uomRt = require('./api/uom.api.js');
var brandRt = require('./api/brand.api.js');
var creditRt = require('./api/credit.card.api.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 3000;

// Enable serving static files.
app.use(express.static(__dirname + '/app'));

// Turn on logging.
app.use(morgan("dev"));

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', [
    menuRt,
    orgHierarchiesRt,
    prodHierarchiesRt,
    supplierRt,
    servingRt,
    reasonsRt,
    vatRt,
    salesmanRt,
    currencyRt,
    instructionRt,
    uomRt,
    brandRt,
    creditRt
]);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log("Listening on port " + port);