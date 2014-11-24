/**
 * Created by Caleb on 11/21/2014.
 */
// BASE SETUP
// =============================================================================

// call the packages we need
var express     = require('express'); 		// call express
var _           = require('lodash');

global.inMemDatabase.hierarchies = {};

var db = global.inMemDatabase.hierarchies;

var params = {
    search: "_search",
    sortField: "orderBy"
};

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// Routes for our API will be specified here

// Hierarchies api
// Config.

// Get all hierarchy configurations.
router.get("/hierarchies/config", function (req, resp) {
    var hierarchies = _.values(db);
    var results = [];
    var fieldRegex = /field_([0-9]+)_label+/i;
    _.forEach(hierarchies, function (hierarchy) {
        var h = _.extend({}, hierarchy);
        var firstId = _(h.items).keys().first();

        if (!firstId) {
            return;
        }

        h.data = (firstId && firstId.length && firstId.length > 0) ? h.items[firstId] : {};
        var customFields = [];

        var key1 = _.keys(h).join(",");
        var match = fieldRegex.exec(key1);
        if (match) {
            var fieldName = match[0];
            var key2 = _.keys(h.data).join(",");
            var valueRegex = new RegExp("field_" + match[1] + "_value", "i");
            var match2 = valueRegex.exec(key2);
            var customField = {};
            customField.name = h[fieldName];

            if (match2) {
                var match2Val = match2[0];
                customField.value = h.data[match2Val]
            }

            customFields.push(customField);
        }

        h.data.customFields = customFields;

        delete h.items;

        results.push(h);
    });

    // Return default configuration.
    if (!_.any(results)){
        results = [
            {pin: 1, active: true, description: "Entity"},
            {pin: 2, active: true, description: "Branch"}
        ]
    }

    resp.json(results);
});

// Get a specific configuration.
router.get("/hierarchies/config/:id", function (req, resp) {
    var id = req.params.id;
    var hierarchy = db[id];
    resp.json(hierarchy);
});

// Create a hierarchy configuration.
router.post("/hierarchies/config", function (req, resp) {
    var maxLevels = 9;
    var hierarchies = req.body; // This is an array...

    // If many levels, return a bad request response.
    if (_.keys(db).length > 0 || hierarchies.length > maxLevels) {
        resp.status(400).send('Bad Request');
        return;
    }

    var prevId = null;
    
    _(hierarchies).forEach(function (config) {
        // Remove open field. Only used in ui.
        delete config.open;

        var last = _.findLast(db);
        var id = (last ? last.id : 0) + 1;

        config.id = id;
        config.active = true;
        if (prevId) {
            config.parentId = prevId;
        }

        config.items = config.items || {};

        var data = null;
        if (config.data) {
            data = config.data;
        }

        if (config.pin === 1) {
            config.description = "Entity";
        } else if (config.pin === 2) {
            config.description = "Branch"
        }

        delete config.data;
        db[id.toString()] = config;

        var hierData = db[id.toString()].items;

        if (data) {
            var lastDat = _.findLast(hierData);
            var datId = (lastDat ? lastDat.id : 0) + 1;
            var fieldCount = 0;

            data.id = datId;
            data.active = true;

            if (data.customFields) {
                _.forEach(data.customFields, function (field) {
                    fieldCount++;

                    config["field_" + fieldCount + "_Active"] = true;
                    config["field_" + fieldCount + "_Mandatory"] = false;
                    config["field_" + fieldCount + "_Label"] = field.name;

                    data["field_" + fieldCount + "_Value"] = field.value;
                });

                delete data.customFields;
            }

            hierData[datId] = data;
        }

        prevId = config.id;
    });

    resp.json(_.values(db));
});

router.put("/hierarchies/config/:id", function (req, resp) {
    var newData = req.body;
    var id = req.params.id;
    var hierarchy = db[id];

    if (!hierarchy) {
        return;
    }

    _.extend(db[id], newData);
    resp.json(db[id]);
});

// Data.
router.get("/hierarchies/:hierarchyId/data", function (req, resp) {
    var fields = ["code", "name", "description", "location"];

    var hierarchyId = parseInt(req.params.hierarchyId);
    var hier = db[hierarchyId];
    if (!hier) {
        resp.status(400).send('Hierarchy not found.');
        return;
    }

    var hierData = hier.items;

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

    var hierarchies = _(hierData).values();

    if (sortField) {
        hierarchies.sortBy(function (item) {
            return [item[sortField]];
        });

        if (/desc/i.test(sortOrder)) {
            hierarchies.reverse();
        }
    }

    if (isTrueRegEx.test(req.query[params.search])) {
        var filter_on_fields = _.intersection(_.keys(req.query), fields);
        if (filter_on_fields) {
            _.forEach(filter_on_fields, function (field) {
                if (_.has(req.query, field)) {
                    hierarchies = hierarchies.filter(function (hierarchy) {
                        var regex = new RegExp(req.query[field], "i");
                        return regex.test(hierarchy[field]);
                    });
                }
            });
        }
    }

    if (!isTrueRegEx.test(req.query["showInactive"])) {
        hierarchies = hierarchies.filter({"active": true});
    }

    // Count our items.
    var inlineCount = hierarchies.size();
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

    hierarchies = hierarchies.rest(skip).first(getFirst);

    var pagedResult = {
        description: hier.description,
        inlineCount: inlineCount,
        maxItems: maxItems,
        page: page,
        pin: hier.pin,
        results: hierarchies.value()
    };

    resp.json(pagedResult);
});

router.get("/hierarchies/:hierarchyId/data/:id", function (req, resp) {
    var id = req.params.id;

    var hierarchyId = parseInt(req.params.hierarchyId);
    var hier = db[hierarchyId];
    if (!hier) {
        resp.status(400).send('Hierarchy not found.');
        return;
    }

    var hierData = hier.items;

    var hierarchy = hierData[id];
    resp.json(hierarchy);
});

router.post("/hierarchies/:hierarchyId/data", function (req, resp) {
    var hierarchyId = parseInt(req.params.hierarchyId);
    var hier = db[hierarchyId];
    if (!hier) {
        resp.status(400).send('Hierarchy not found.');
        return;
    }

    var hierData = hier.items;

    var hierarchy = req.body;
    var last = _.findLast(hierData);
    var id = (last ? last.id : 0) + 1;

    hierarchy.id = id;
    hierarchy.active = true;
    hierData[id.toString()] = hierarchy;
    resp.json(hierarchy);
});

router.put("/hierarchies/:hierarchyId/data/:id", function (req, resp) {
    var hierarchyId = parseInt(req.params.hierarchyId);
    var hier = db[hierarchyId];
    if (!hier) {
        resp.status(400).send('Hierarchy not found.');
        return;
    }

    var hierData = hier.items;

    var newData = req.body;
    var id = req.params.id;
    var hierarchy = hierData[id];

    if (!hierarchy) {
        return;
    }

    _.extend(hierData[id], newData);
    resp.json(hierData[id]);
});

router.post("/hierarchies/:hierarchyId/data/activate", function (req, resp) {
    var hierarchyId = parseInt(req.params.hierarchyId);
    var hier = db[hierarchyId];
    if (!hier) {
        resp.status(400).send('Hierarchy not found.');
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

router.post("/hierarchies/:hierarchyId/data/deactivate", function (req, resp) {
    var hierarchyId = parseInt(req.params.hierarchyId);
    var hier = db[hierarchyId];
    if (!hier) {
        resp.status(400).send('Hierarchy not found.');
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