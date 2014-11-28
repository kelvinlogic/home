/**
 * Created by njuguna on 11/27/2014.
 */
// call the packages we need
var express     = require('express'); 		// call express
var _           = require('lodash');

global.inMemDatabase.salesman = {};

var db = global.inMemDatabase.salesman;

var params = {
    search: "_search",
    sortField: "orderBy"
};

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// Routes for our API will be specified here
// Get all reasons api.

router.put("/salesman/:id", function (req, resp) {
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
router.get("/salesman", function (req, resp) {
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

router.get("/salesman/:id", function (req, resp) {
    var id = req.params.id;
    var reason = db[id];
    resp.json(reason);
});

router.post("/salesman", function (req, resp) {
    var slm= _.values(db);
    var data = req.body;
    var last = _.findLast(slm);
    var id = (last ? last.id : 0) + 1;
    data.id = id;
    data.active = true;
    db[id.toString()] = data;
    resp.json(data);
});

router.put("/salesman/:id", function (req, resp) {
    var newData = req.body;
    var id = req.params.id;
    var slm = newData[id];

    if (!slm) {
        return;
    }

    _.extend(newData[id], newData);
    resp.json(newData[id]);
});

router.post("/salesman/activate", function (req, resp) {
    var slm = _.values(db);
    if (!slm) {
        resp.status(400).send('reasons not found.');
        return;
    }

    var slmData = slm.items;

    var ids = req.body;
    var activated = [];

    var activate = function (id) {
        if (slmData[id] && !slmData[id].active) {
            slmData[id].active = true;
            activated.push(slmData[id]);
        }
    };

    _.forEach(ids, function (id) {
        activate(id);
    });

    resp.json(activated);
});

router.post("/salesman/deactivate", function (req, resp) {
    var slm =_.values(db);
    if (!slm) {
        resp.status(400).send('reasons not found.');
        return;
    }

    var slmData = slm.items;

    var ids = req.body;
    var deactivated = [];

    var deactivate = function (id) {
        if (slmData[id] && slmData[id].active) {
            slmData[id].active = false;
            deactivated.push(slmData[id]);
        }
    };

    _.forEach(ids, function (id) {
        deactivate(id);
    });

    resp.json(deactivated);
});

module.exports = router;

