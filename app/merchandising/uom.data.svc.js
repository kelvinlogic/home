/**
 * Created by Kelvin on 11/26/2014.
 */
(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("uomDataSvc", uomDataSvcProvider);
    /* @ngInject */
    function uomDataSvcProvider() {
        // Available in config.
        var cfg = this;
        cfg.uomConfigUrl = null;
        cfg.$get = uomDataSvc;

        uomDataSvc.$inject = ["$http", "$q"];

        function uomDataSvc($http, $q) {
            return {
                createUom: createUom,
                activateUoms: activateUoms,
                deactivateUoms: deactivateUoms,
                getUoms: getUoms,
                updateUom: updateUom,
                searchFilter:searchFilter
            };
            /*
             * methods to perform server requests that interact with the
             * API
             */
            function createUom(data) {
                var url = cfg.uomConfigUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }
            function searchFilter(data){
                console.log(data);
                var url = cfg.uomConfigUrl;
                return $http.get(url, data).then(function (result) {
                    return result.data;
                });
            }
            function deactivateUoms(ids) {
                // Ensure that the endpoint only gets arrays.
                console.log(ids)
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.uomConfigUrl;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }
            function activateUoms(ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.uomConfigUrl;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }
            function getUoms( page, pageSize, filter, showInactive, replaceRemoved, refresh) {
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

                return $http.get(cfg.uomConfigUrl, config).then(function (result) {
                    return result.data;
                });
            }
            function updateUom(id, uom) {
                return $http.put(cfg.uomConfigUrl + "/" + id, uom).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();

