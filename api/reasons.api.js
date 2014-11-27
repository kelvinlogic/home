/**
 * Created by njuguna on 11/26/2014.
 */
// call the packages we need
var express     = require('express'); 		// call express
var _           = require('lodash');

global.inMemDatabase.reasons = {};

var db = global.inMemDatabase.reasons;

var params = {
    search: "_search",
    sortField: "orderBy"
};

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// Routes for our API will be specified here
// Get all reasons api.

router.put("/reasons/:id", function (req, resp) {
    var newData = req.body;
    var id = req.params.id;
    var reasons = db[id];
    if (!reasons) {
        return;
    }

    _.extend(db[id], newData);
    resp.json(db[id]);
});

// Data.
router.get("/reasons", function (req, resp) {
    var fields=["id","code","description"];
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

    var reasons = _(db).values();

    if (sortField) {
        reasons.sortBy(function (item) {
            return [item[sortField]];
        });

        if (/desc/i.test(sortOrder)) {
            reasons.reverse();
        }
    }

    if (isTrueRegEx.test(req.query[params.search])) {
        var filter_on_fields = _.intersection(_.keys(req.query), fields);
        if (filter_on_fields) {
            _.forEach(filter_on_fields, function (field) {
                if (_.has(req.query, field)) {
                    reasons = reasons.filter(function (reason) {
                        var regex = new RegExp(req.query[field], "i");
                        return regex.test(reason[field]);
                    });
                }
            });
        }
    }

    if (!isTrueRegEx.test(req.query["showInactive"])) {
        reasons = reasons.filter({"active": true});
    }

    var inlineCount = reasons.size();

    reasons = reasons.rest(skip).first(getFirst);

    var pagedResult = {
        maxItems: maxItems,
        page: page,
        inlineCount: inlineCount,
        results: reasons.value()
    };

    resp.json(pagedResult);
});

router.get("/reasons/:id", function (req, resp) {
    var id = req.params.id;
    var reason = db[id];
    resp.json(reason);
});

router.post("/reasons", function (req, resp) {
    var reasons= _.values(db);
    var data = req.body;
    var last = _.findLast(reasons);
    var id = (last ? last.id : 0) + 1;
    data.id = id;
    data.active = true;
    db[id.toString()] = data;
    resp.json(data);
});

router.put("/reasons/:id", function (req, resp) {
    var newData = req.body;
    var id = req.params.id;
    var reason = newData[id];

    if (!reason) {
        return;
    }

    _.extend(newData[id], newData);
    resp.json(newData[id]);
});

router.post("/reasons/activate", function (req, resp) {
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

router.post("/reasons/deactivate", function (req, resp) {
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
