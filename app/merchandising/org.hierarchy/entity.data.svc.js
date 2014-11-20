(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("entityDataSvc", entityDataSvcProvider);

    /* @ngInject */
    function entityDataSvcProvider() {
        // Available in config.
        var cfg = this;
        cfg.entityUrl = null;
        cfg.deactivateEndpoint = "deactivate";

        cfg.$get = entityDataSvc;

        entityDataSvc.$inject = ["$http", "$q"];

        function entityDataSvc($http, $q) {
            return {
                createEntity: createEntity,
                deactivateEntities: deactivateEntities,
                getEntities: getEntities,
                updateEntity: updateEntity
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function createEntity(entity) {
                return $http.post(cfg.entityUrl, entity).then(function (result) {
                    return result.data;
                });
            }

            function deactivateEntities(ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.entityUrl + "/" + cfg.deactivateEndpoint;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function getEntities(page, pageSize, filter, showInactive, replaceRemoved) {
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

                if (filter) {
                    if (filter) {
                        config.params.filter = filter;
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

                return $http.get(cfg.entityUrl, config).then(function (result) {
                    return result.data;
                });
            }

            function updateEntity(id, entity) {
                return $http.put(cfg.entityUrl + "/" + id, entity).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();