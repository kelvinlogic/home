/**
 * Created by Kelvin on 11/25/2014.
 */
// BASE SETUP
// =============================================================================

// call the packages we need
var express     = require('express'); 		// call express
var _           = require('lodash');

global.inMemDatabase.currencies = {};

var db = global.inMemDatabase.currencies;

var params = {
    search: "_search",
    sortField: "orderBy"
};

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// Routes for our API will be specified here

// Currencies api

// Get all currency.
router.get("/currencies", function (req, resp) {
    var fields = ["id","symbol","precision","scale","symbol_before_amount","display_symbol","order","name", "unit", "sub_unit"];
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

    var currencies = _(db).values();

    if (sortField) {
        currencies.sortBy(function (item) {
            return [item[sortField]];
        });

        if (/desc/i.test(sortOrder)) {
            currencies.reverse();
        }
    }

    if (isTrueRegEx.test(req.query[params.search])) {
        var filter_on_fields = _.intersection(_.keys(req.query), fields);
        if (filter_on_fields) {
            _.forEach(filter_on_fields, function (field) {
                if (_.has(req.query, field)) {
                    currencies = currencies.filter(function (entity) {
                        var regex = new RegExp(req.query[field], "i");
                        return regex.test(entity[field]);
                    });
                }
            });
        }
    }

    if (!isTrueRegEx.test(req.query["showInactive"])) {
        currencies = currencies.filter({"active": true});
    }

    var inlineCount = currencies.size();

    currencies = currencies.rest(skip).first(getFirst);

    var pagedResult = {
        maxItems: maxItems,
        page: page,
        inlineCount: inlineCount,
        results: currencies.value()
    };

    resp.json(pagedResult);
});
// Get a specific currency.
router.get("/currencies/:id", function (req, resp) {
    var id = req.params.id;
    var currency = db[id];
    resp.json(currency);
});
// Create a currency
router.post("/currencies", function (req, resp) {
    var currency = req.body;
    var last = _.findLast(db);
    var id = (last ? last.id : 0) + 1;

    currency.id = id;
    currency.active = true;
    db[id.toString()] = currency;
    resp.json(currency);
});

router.put("/currencies/:id", function (req, resp) {
    var newData = req.body;
    var id = req.params.id;
    var currency = db[id];

    if (!currency) {
        return;
    }

    _.extend(db[id], newData);
    resp.json(db[id]);
});

router.post("/currencies/activate", function (req, resp) {
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
router.post("/currencies/deactivate", function (req, resp) {
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

module.exports = router;
