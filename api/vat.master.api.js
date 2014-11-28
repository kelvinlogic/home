/**
 * Created by njuguna on 11/26/2014.
 */
var express     = require('express'); 		// call express
var _           = require('lodash');

global.inMemDatabase.vat = {};

var db = global.inMemDatabase.vat;

var params = {
    search: "_search",
    sortField: "orderBy"
};

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// Routes for our API will be specified here
// Get all vat api.

router.put("/vat/:id", function (req, resp) {
    var newData = req.body;
    var id = req.params.id;
    var vat = db[id];
    if (!vat) {
        return;
    }

    _.extend(db[id], newData);
    resp.json(db[id]);
});

// Data.
router.get("/vat", function (req, resp) {
    var fields=["id","code","name","percentage"];
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

    var vat = _(db).values();

    if (sortField) {
        vat.sortBy(function (item) {
            return [item[sortField]];
        });

        if (/desc/i.test(sortOrder)) {
            vat.reverse();
        }
    }

    if (isTrueRegEx.test(req.query[params.search])) {
        var filter_on_fields = _.intersection(_.keys(req.query), fields);
        if (filter_on_fields) {
            _.forEach(filter_on_fields, function (field) {
                if (_.has(req.query, field)) {
                    vat = vat.filter(function (vat) {
                        var regex = new RegExp(req.query[field], "i");
                        return regex.test(vat[field]);
                    });
                }
            });
        }
    }

    if (!isTrueRegEx.test(req.query["showInactive"])) {
        vat = vat.filter({"active": true});
    }

    var inlineCount = vat.size();

    vat = vat.rest(skip).first(getFirst);

    var pagedResult = {
        maxItems: maxItems,
        page: page,
        inlineCount: inlineCount,
        results: vat.value()
    };

    resp.json(pagedResult);
});

router.get("/vat/:id", function (req, resp) {
    var id = req.params.id;
    var vat = db[id];
    resp.json(vat);
});

router.post("/vat", function (req, resp) {
    var vat= _.values(db);
    var data = req.body;
    var last = _.findLast(vat);
    var id = (last ? last.id : 0) + 1;
    data.id = id;
    data.active = true;
    db[id.toString()] = data;
    resp.json(data);
});

router.put("/vat/:id", function (req, resp) {
    var newData = req.body;
    var id = req.params.id;
    var vat = newData[id];

    if (!vat) {
        return;
    }

    _.extend(newData[id], newData);
    resp.json(newData[id]);
});

router.post("/vat/activate", function (req, resp) {
    var hier = _.values(db);
    if (!hier) {
        resp.status(400).send('vat not found.');
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

router.post("/vat/deactivate", function (req, resp) {
    var hier =_.values(db);
    if (!hier) {
        resp.status(400).send('vat not found.');
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

