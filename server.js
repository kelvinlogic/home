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

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 4000;
var db = {};
var params = {
    search: "_search",
    sortField: "sort_field",
    sortOrder: "sort_order"
};

// Enable serving static files.
app.use(express.static(__dirname + '/app'));

// Turn on logging.
app.use(morgan("dev"));

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// Routes for our API will be specified here

// Entities api
router.get("/entities", function (req, resp) {
    var fields = ["code", "name", "description", "location"];
    var max = (isNaN(parseInt(req.query.max)) ? undefined : parseInt(req.query.max)) || 10;
    var page = (isNaN(parseInt(req.query.page)) ? undefined : parseInt(req.query.page)) || 1;
    var sortOrder = req.query[params.sortOrder];
    var sortField = req.query[params.sortField];

    var skip = (page - 1) * max;

    var entities = _(db).values();

    if (sortField) {
        entities.sortBy(function (item) {
            return [item[sortField]];
        });

        if (/desc/i.test(sortOrder)) {
            entities.reverse();
        }
    }

    if (/true/i.test(req.query[params.search])) {
        var filter_on_fields = _.intersection(_.keys(req.query), fields);
        if (filter_on_fields) {
            _.forEach(filter_on_fields, function (field) {
                if (_.has(req.query, field)) {
                    entities = entities.filter(function (entity) {
                        var regex = new RegExp(req.query[field], "i");
                        return regex.test(entity[field]);
                    });
                }
            });
        }
    }

    var total = entities.size();

    entities = entities.rest(skip).first(max);

    var pagedResult = {
        max: max,
        page: page,
        total: total,
        rows: entities.value()
    };

    resp.json(pagedResult);
});

router.get("/entities/:id", function (req, resp) {
    var id = req.params.id;
    var entity = db[id];
    resp.json(entity);
});

router.post("/entities", function (req, resp) {
    var entity = req.body;
    var last = _.findLast(db);
    var id = (last ? last.id : 0) + 1;

    delete entity.oper;

    entity.id = id;
    db[id.toString()] = entity;
    resp.json(entity);
});

router.put("/entities/:id", function (req, resp) {
    var newData = req.body;
    var idStr = req.params.id;
    var entity = db[idStr];

    if (!entity) {
        return;
    }

    delete newData.oper;

    _.assign(db[idStr], newData);
    resp.json(db[idStr]);
});

router.delete("/entities/:id", function (req, resp) {
    var idStr = req.params.id;
    var entity = db[idStr];

    if (!entity) {
        return false;
    }

    resp.json(delete db[idStr]);
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log("Listening on port " + port);