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
    sortField: "orderBy"
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
    var maxItems = (isNaN(parseInt(req.query.pageSize)) ? 10 : parseInt(req.query.pageSize));
    var page = (isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page)) || 1;
    var replaceRemoved = (isNaN(parseInt(req.query.replaceRemoved)) ? 0 : parseInt(req.query.replaceRemoved)) || 0;

    var sortOrder = null;
    var sortField = null;
    var isTrueRegEx = /true/i;

    if (req.query[params.sortField]) {
        var orderString = req.query[params.sortField];
        var split = orderString.split(" ");
        sortOrder = _.first(split);
        sortField = split.length > 1 ? split[1] : "asc";
    }

    var skip = (page - 1) * maxItems;
    var getFirst = maxItems;

    if (replaceRemoved > 0) {
        skip += (maxItems - replaceRemoved);
        getFirst = replaceRemoved;
    }

    var entities = _(db).values();

    if (sortField) {
        entities.sortBy(function (item) {
            return [item[sortField]];
        });

        if (/desc/i.test(sortOrder)) {
            entities.reverse();
        }
    }

    if (isTrueRegEx.test(req.query[params.search])) {
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

    if (!isTrueRegEx.test(req.query["showInactive"])) {
        entities = entities.filter({"active": true});
    }

    var inlineCount = entities.size();

    entities = entities.rest(skip).first(getFirst);

    var pagedResult = {
        maxItems: maxItems,
        page: page,
        inlineCount: inlineCount,
        results: entities.value()
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

    entity.id = id;
    entity.active = true;
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

    _.assign(db[idStr], newData);
    resp.json(db[idStr]);
});

router.post("/entities/activate", function (req, resp) {
    var ids = req.body;
    var activated = [];

    var deactivate = function (id) {
        if (db[id] && !db[id].active) {
            db[id].active = true;
            activated.push(db[id]);
        }
    };

    _.forEach(ids, function (id) {
        deactivate(id);
    });

    resp.json(activated);
});

router.post("/entities/deactivate", function (req, resp) {
    var ids = req.body;
    var deactivated = [];

    var deactivate = function (id) {
        if (db[id] && db[id].active) {
            db[id].active = false;
            deactivated.push(db[id]);
        }
    };

    _.forEach(ids, function (id) {
        deactivate(id);
    });

    resp.json(deactivated);
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log("Listening on port " + port);