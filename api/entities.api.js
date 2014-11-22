/**
 * Created by Caleb on 11/21/2014.
 */
// BASE SETUP
// =============================================================================

// call the packages we need
var express     = require('express'); 		// call express
var _           = require('lodash');

var db = {};
var params = {
    search: "_search",
    sortField: "orderBy"
};

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// Routes for our API will be specified here

// Entities api
router.get("/entities", function (req, resp) {
    var fields = ["code", "name", "description", "location"];
    var rawPageSize = parseInt(req.query.pageSize);
    var rawPage = parseInt(req.query.page);
    var rawReplaceRemoved = parseInt(req.query.replaceRemoved);

    var maxItems = isNaN(rawPageSize) ? 10 : rawPageSize;
    var page = isNaN(rawPage) ? 1 : rawPage;
    var replaceRemoved = isNaN(rawReplaceRemoved) ? 0 : (rawReplaceRemoved || 0);

    var sortOrder = null;
    var sortField = null;
    var isTrueRegEx = /true/i;

    if (req.query[params.sortField]) {
        var orderString = req.query[params.sortField];
        var split = orderString.split(" ");
        sortOrder = _.first(split);
        sortField = split.length > 1 ? split[1] : "asc";
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

    // Count our items.
    var inlineCount = entities.size();
    var pages = Math.ceil(inlineCount / maxItems);

    // Make sure the page is between 1 and the maximum number of pages.
    if (page < 1) {
        page = 1;
    } else if (page > pages) {
        page = pages;
    }

    // If we're refreshing, fetch the first page...
    if (isTrueRegEx.test(req.query.refresh)) {
        page = 1;
    }

    var skip = (page - 1) * maxItems;

    var getFirst = maxItems;

    if (replaceRemoved > 0) {
        // Also skip items already being shown in the view.
        skip += (maxItems - replaceRemoved);

        // Only get items equal to the removed items.
        getFirst = replaceRemoved;
    }

    getFirst = Math.min((inlineCount - ((page - 1) * maxItems)), getFirst);

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

module.exports = router;