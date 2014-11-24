/**
 * Created by Caleb on 11/24/2014.
 */
// BASE SETUP
// =============================================================================

// call the packages we need
var express     = require('express'); 		// call express
var _           = require('lodash');

global.inMemDatabase.navbarMenu = {
    "1": {
        "id": 1,
        "name": "Configuration"
    },
    "2": {
        "id": 2,
        "name": "Language",
        "href": "configuration.html#/language-config",
        "parentId": 1
    },
    "3": {
        "id": 3,
        "name": "Hierarchy",
        "href": "configuration.html#/hierarchy-config",
        "parentId": 1
    },
    "4": {
        "id": 4,
        "name": "Merchandising"
    },
    "5": {
        "id": 5,
        "name": "Org. Hierarchy",
        "parentId": 4
    },
    "6": {
        "id": 6,
        "name": "Product Hierarchy",
        "parentId": 4
    },
    "7": {
        "id": 7,
        "name": "VAT Master",
        "href": "merchandising.html#/vat-master",
        "parentId": 4
    },
    "8": {
        "id": 8,
        "name": "Supplier Master",
        "href": "merchandising.html#/supplier-master",
        "parentId": 4
    },
    "9": {
        "id": 9,
        "name": "Supplier Product Mapping",
        "href": "merchandising.html#/supplier-product-mapping",
        "parentId": 4
    },
    "10": {
        "id": 10,
        "name": "Salesman Master",
        "href": "merchandising.html#/salesman-master",
        "parentId": 4
    },
    "11": {
        "id": 11,
        "name": "UOM Master",
        "href": "merchandising.html#/uom-master",
        "parentId": 4
    },
    "12": {
        "id": 12,
        "name": "Serving UOM Master",
        "href": "merchandising.html#/serving-uom-master",
        "parentId": 4
    },
    "13": {
        "id": 13,
        "name": "Product Attributes Master",
        "href": "merchandising.html#/product-attributes-master",
        "parentId": 4
    },
    "14": {
        "id": 14,
        "name": "Product Brand Master",
        "href": "merchandising.html#/product-brand-master",
        "parentId": 4
    },
    "15": {
        "id": 15,
        "name": "Product Ordering Master",
        "href": "merchandising.html#/product-positioning-master",
        "parentId": 4
    },
    "16": {
        "id": 16,
        "name": "Currency Master",
        "href": "merchandising.html#/currency-master",
        "parentId": 4
    },
    "17": {
        "id": 17,
        "name": "Instructions Master",
        "href": "merchandising.html#/instructions-master",
        "parentId": 4
    },
    "18": {
        "id": 18,
        "name": "Reasons Master",
        "href": "merchandising.html#/reasons-master",
        "parentId": 4
    },
    "19": {
        "id": 19,
        "name": "Credit Card Master",
        "href": "merchandising.html#/credit-card-master",
        "parentId": 4
    },
    "20": {
        "id": 20,
        "name": "Mapping",
        "href": "merchandising.html#/product-hierarchy-mapping",
        "parentId": 6
    }
};

var db = global.inMemDatabase.navbarMenu;

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// Routes for our API will be specified here

// Menu api
// Config.

// Get all hierarchy configurations.
router.get("/menu/navbar", function (req, resp) {
    var allCloned = _.map(_.values(db), function (menu) {
        return _.extend({}, menu);
    });
    var results = _.filter(allCloned, function (menu) {
        return !menu.parentId;
    });

    var childMenus = _.filter(allCloned, function (menu) {
        return menu.parentId;
    });

    function setupOrgHierarchy() {
        var orgHierarchy = _(allCloned).filter({id: 5}).first();
        var count = 0;

        if (orgHierarchy) {
            // Populate the org. hierarchy.
            var hierarchies = _.values(global.inMemDatabase.hierarchies);
            if (hierarchies && hierarchies.length > 0) {
                var last = _.last(allCloned);
                var lastId = (last && last.id) ? last.id : 1;
                orgHierarchy.items = [];

                _.forEach(hierarchies, function (hierarchy) {
                    count++;
                    var h = _.extend({}, hierarchy);

                    var navData = {
                        id: lastId + count,
                        name: h.description,
                        href: "merchandising.html#/hierarchy-master/" + h.id,
                        parentId: orgHierarchy.id
                    };

                    orgHierarchy.items.push(navData);
                });

                if (orgHierarchy.parentId) {
                    var parent = _.filter(allCloned, {id: orgHierarchy.parentId});

                    if (parent) {
                        parent.items = _.isArray(parent.items) ? parent.items : [];
                        parent.items.push(orgHierarchy);
                    }
                } else {
                    results.push(orgHierarchy);
                }
            } else {
                var index = results.indexOf(orgHierarchy);
                if (index < 0) {
                    index = childMenus.indexOf(orgHierarchy);
                    childMenus.splice(index, 1);
                } else {
                    results.splice(index, 1);
                }
            }
        }
    }

    function setupProdHierarchy() {
        var prodHierarchy = _(allCloned).filter({id: 6}).first();
        var count = 0;

        if (prodHierarchy) {
            // Populate the org. hierarchy.
            var products = [];
            if (products && products.length > 0) {
                var last = _.last(allCloned);
                var lastId = (last && last.id) ? last.id : 1;
                prodHierarchy.items = [];

                _.forEach(products, function (product) {
                    count++;
                    var p = _.extend({}, product);

                    var navData = {
                        id: lastId + count,
                        name: p.description,
                        href: "merchandising.html#/product-master/" + p.id,
                        parentId: prodHierarchy.id
                    };

                    prodHierarchy.items.push(navData);
                });

                if (prodHierarchy.parentId) {
                    var parent = _.filter(allCloned, {id: prodHierarchy.parentId});

                    if (parent) {
                        parent.items = _.isArray(parent.items) ? parent.items : [];
                        parent.items.push(prodHierarchy);
                    }
                } else {
                    results.push(prodHierarchy);
                }
            } else {
                var index = results.indexOf(prodHierarchy);
                if (index < 0) {
                    index = childMenus.indexOf(prodHierarchy);
                    childMenus.splice(index, 1);
                } else {
                    results.splice(index, 1);
                }
            }
        }
    }

    setupOrgHierarchy();
    setupProdHierarchy();

    // Add each child to its parent.
    _.forEach(childMenus, function (menu) {
        var m = _.extend({}, menu);

        var parent = _(allCloned).filter({id: m.parentId}).first();

        if (parent && parent.id) {
            parent.items = _.isArray(parent.items) ? parent.items : [];
            parent.items.push(m);
        } else {
            results.push(m);
        }
    });

    resp.json(results);
});

module.exports = router;