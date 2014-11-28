/**
 * Created by Caleb on 11/21/2014.
 */
// BASE SETUP
// =============================================================================

// call the packages we need
var express     = require('express'); 		// call express
var _           = require('lodash');

global.inMemDatabase.suppliers = {};

var db = global.inMemDatabase.suppliers;

var params = {
    search: "_search",
    sortField: "orderBy"
};

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// Routes for our API will be specified here
// Get a specific configuration.
router.get("/suppliers/:id", function (req, resp) {
    var id = req.params.id;
    var supplier = db[id];
    resp.json(supplier);
});

router.post("/suppliers", function (req, resp) {
    var suppliers = _.values(db);
    var supplier = req.body;
    var last = _.findLast(suppliers);
    var id = (last ? last.id : 0) + 1;

    supplier.id = id;
    supplier.active = true;
    db[id] = supplier;
    resp.json(supplier);
});

router.put("/suppliers/:id", function (req, resp) {
    var newData = req.body;
    var id = req.params.id;
    var supplier = db[id];

    if (!supplier) {
        return;
    }

    _.extend(db[id], newData);
    resp.json(db[id]);
});

// Data.
router.get("/suppliers", function (req, resp) {
    var fields=["id", "code", "name","terms","currency","credit_limit","credit_days","status"];
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

    var suppliers = _(db).values();

    if (sortField) {
        suppliers.sortBy(function (item) {
            return [item[sortField]];
        });

        if (/desc/i.test(sortOrder)) {
            suppliers.reverse();
        }
    }

    if (isTrueRegEx.test(req.query[params.search])) {
        var filter_on_fields = _.intersection(_.keys(req.query), fields);
        if (filter_on_fields) {
            _.forEach(filter_on_fields, function (field) {
                if (_.has(req.query, field)) {
                    suppliers = suppliers.filter(function (supplier) {
                        var regex = new RegExp(req.query[field], "i");
                        return regex.test(supplier[field]);
                    });
                }
            });
        }
    }

    if (!isTrueRegEx.test(req.query["showInactive"])) {
        suppliers = suppliers.filter({"active": true});
    }

    var inlineCount = suppliers.size();

    suppliers = suppliers.rest(skip).first(getFirst);

    var pagedResult = {
        maxItems: maxItems,
        page: page,
        inlineCount: inlineCount,
        results: suppliers.value()
    };

    resp.json(pagedResult);
});
router.put("/suppliers/:id", function (req, resp) {
    var newData = req.body;
    var id = req.params.id;
    var supplier = newData[id];

    if (!supplier) {
        return;
    }
    _.extend(newData[id], newData);
    resp.json(newData[id]);
});

router.post("/suppliers/activate", function (req, resp) {
    var hier = _.values(db);
    if (!hier) {
        resp.status(400).send('reasons not found.');
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

router.post("/suppliers/deactivate", function (req, resp) {
    var hier =_.values(db);
    if (!hier) {
        resp.status(400).send('reasons not found.');
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