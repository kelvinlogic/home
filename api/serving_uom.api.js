/**
 * Created by njuguna on 11/26/2014.
 */
/**
 * Created by Caleb on 11/21/2014.
 */
// BASE SETUP
// =============================================================================

// call the packages we need
var express     = require('express'); 		// call express
var _           = require('lodash');

global.inMemDatabase.servings = {};

var db = global.inMemDatabase.servings;

var params = {
    search: "_search",
    sortField: "orderBy"
};

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// Routes for our API will be specified here
// Get all serving api.

router.put("/serving/:id", function (req, resp) {
    var newData = req.body;
    var id = req.params.id;
    var serving = db[id];

    if (!serving) {
        return;
    }

    _.extend(db[id], newData);
    resp.json(db[id]);
});

// Data.
router.get("/serving", function (req, resp) {
    var fields=["id", "code", "description","locale","status"];
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

    var servings = _(db).values();

    if (sortField) {
        servings.sortBy(function (item) {
            return [item[sortField]];
        });

        if (/desc/i.test(sortOrder)) {
            servings.reverse();
        }
    }

    if (isTrueRegEx.test(req.query[params.search])) {
        var filter_on_fields = _.intersection(_.keys(req.query), fields);
        if (filter_on_fields) {
            _.forEach(filter_on_fields, function (field) {
                if (_.has(req.query, field)) {
                    servings = servings.filter(function (serving) {
                        var regex = new RegExp(req.query[field], "i");
                        return regex.test(serving[field]);
                    });
                }
            });
        }
    }

    if (!isTrueRegEx.test(req.query["showInactive"])) {
        servings = servings.filter({"active": true});
    }

    var inlineCount = servings.size();

    servings = servings.rest(skip).first(getFirst);

    var pagedResult = {
        maxItems: maxItems,
        page: page,
        inlineCount: inlineCount,
        results: servings.value()
    };

    resp.json(pagedResult);
});

router.get("/serving/:id", function (req, resp) {
    var id = req.params.id;
   var serving = db[id];
    resp.json(serving);
});

router.post("/serving", function (req, resp) {
   var servings= _.values(db);
    var data = req.body;
    var last = _.findLast(servings);
    var id = (last ? last.id : 0) + 1;
    data.id = id;
    data.active = true;
    db[id.toString()] = data;
    resp.json(data);
});

router.put("/serving/:id", function (req, resp) {
    var newData = req.body;
    var id = req.params.id;
    var serving = newData[id];

    if (!serving) {
        return;
    }

    _.extend(newData[id], newData);
    resp.json(newData[id]);
});

router.post("/serving/activate", function (req, resp) {
    var hier = _.values(db);
    if (!hier) {
        resp.status(400).send('serving uom not found.');
        return;
    }

    var hierData = hier.items;

    var ids = req.body;
    var activated = [];

    var activate = function (id) {
        if (hierData[id] && !hierData[id].active) {
            hierData[id].active = true;
            activated.push(hierData[id]);
        }
    };

    _.forEach(ids, function (id) {
        activate(id);
    });

    resp.json(activated);
});

router.post("/serving/deactivate", function (req, resp) {
    var hier =_.values(db);
    if (!hier) {
        resp.status(400).send('serving uom not found.');
        return;
    }

    var hierData = hier.items;

    var ids = req.body;
    var deactivated = [];

    var deactivate = function (id) {
        if (hierData[id] && hierData[id].active) {
            hierData[id].active = false;
            deactivated.push(hierData[id]);
        }
    };

    _.forEach(ids, function (id) {
        deactivate(id);
    });

    resp.json(deactivated);
});

module.exports = router;