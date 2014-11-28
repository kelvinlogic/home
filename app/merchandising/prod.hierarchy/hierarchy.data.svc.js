(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("prodHierarchyDataSvc", prodHierarchyDataSvcProvider);

    /* @ngInject */
    function prodHierarchyDataSvcProvider() {
        // Available in config.
        var cfg = this;

        cfg.activateEndpoint = "activate";
        cfg.deactivateEndpoint = "deactivate";
        cfg.hierarchyConfigUrl = null;
        cfg.hierarchyDataUrlTpl = null;

        cfg.$get = prodHierarchyDataSvc;

        prodHierarchyDataSvc.$inject = ["$http", "$q"];

        function prodHierarchyDataSvc($http, $q) {
            return {
                activateHierarchiesData: activateHierarchiesData,
                createHierarchyData: createHierarchyData,
                createHierarchyConfig: createHierarchyConfig,
                deactivateHierarchiesData: deactivateHierarchiesData,
                getHierarchiesData: getHierarchiesData,
                getHierarchyConfig: getHierarchyConfig,
                getHierarchyData: getHierarchyData,
                updateHierarchyData: updateHierarchyData
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function activateHierarchiesData(hierarchyId, ids) {
                if (!hierarchyId) {
                    return $q.reject("No hierarchy id.");
                }

                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.hierarchyDataUrlTpl.replace("{hierarchyId}", hierarchyId) + "/" + cfg.activateEndpoint;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function createHierarchyData(hierarchyId, data) {
                if (!hierarchyId) {
                    return $q.reject("No hierarchy id.");
                }

                var url = cfg.hierarchyDataUrlTpl.replace("{hierarchyId}", hierarchyId);
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }

            function createHierarchyConfig(config) {
                var url = cfg.hierarchyConfigUrl;
                return $http.post(url, config).then(function (result) {
                    return result.data;
                });
            }

            function deactivateHierarchiesData(hierarchyId, ids) {
                if (!hierarchyId) {
                    return $q.reject("No hierarchy id.");
                }

                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }


                var url = cfg.hierarchyDataUrlTpl.replace("{hierarchyId}", hierarchyId) + "/" + cfg.deactivateEndpoint;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function getHierarchiesData(hierarchyId, page, pageSize, filterOptions, showInactive, replaceRemoved, refresh) {
                if (!hierarchyId) {
                    return $q.reject("No hierarchy id.");
                }

                if (!page) {
                    page = 1;
                }

                if (!pageSize) {
                    pageSize = 12;
                }

                var config = {
                    params: {
                        page: page,
                        pageSize: pageSize
                    }
                };

                if (filterOptions._search) {
                    config.params._search = filterOptions._search;

                    if (filterOptions.fields.length > 0) {
                        _.forEach(filterOptions.fields, function (field) {
                            config.params[field] = filterOptions.query;
                        });
                    } else {
                        config.params._all = filterOptions.query;
                    }
                }

                if (showInactive) {
                    if (showInactive) {
                        config.params.showInactive = showInactive;
                    }
                }

                if (replaceRemoved) {
                    if (replaceRemoved) {
                        config.params.replaceRemoved = replaceRemoved;
                    }
                }

                if (refresh) {
                    if (refresh) {
                        config.params.refresh = refresh;
                    }
                }

                var url = cfg.hierarchyDataUrlTpl.replace("{hierarchyId}", hierarchyId);
                return $http.get(url, config).then(function (result) {
                    return result.data;
                });
            }

            function getHierarchyConfig() {
                var url = cfg.hierarchyConfigUrl;
                return $http.get(url).then(function (result) {
                    return result.data;
                });
            }

            function getHierarchyData(hierarchyId, id) {
                if (!hierarchyId) {
                    return $q.reject("No hierarchy id.");
                }

                var url = cfg.hierarchyDataUrlTpl.replace("{hierarchyId}", hierarchyId) + "/" + id;

                return $http.get(url).then(function (result) {
                    return result.data;
                });
            }

            function updateHierarchyData(hierarchyId, id, hierarchyData) {
                if (!hierarchyId) {
                    return $q.reject("No hierarchy id.");
                }

                var url = cfg.hierarchyDataUrlTpl.replace("{hierarchyId}", hierarchyId) + "/" + id;
                return $http.put(url, hierarchyData).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();