/**
 * Created by Kelvin on 11/26/2014.
 */
(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("brandDataSvc", brandDataSvcProvider);

    /* @ngInject */
    function brandDataSvcProvider() {
        // Available in config.
        var cfg = this;
        cfg.brandConfigUrl = null;
        cfg.$get = brandDataSvc;

        brandDataSvc.$inject = ["$http", "$q"];

        function brandDataSvc($http, $q) {
            return {
                createBrand: createBrand,
                activateBrands: activateBrands,
                deactivateBrands: deactivateBrands,
                getBrands: getBrands,
                updateBrand: updateBrand,
                searchFilter:searchFilter
            };
            /*
             * methods to perform server requests that interact with the
             * API
             */
            function createBrand(data) {
                var url = cfg.brandConfigUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }
            function searchFilter(data){
                console.log(data);
                var url = cfg.brandConfigUrl;
                return $http.get(url, data).then(function (result) {
                    return result.data;
                });
            }
            function deactivateBrands(ids) {
                // Ensure that the endpoint only gets arrays.
                console.log(ids)
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.brandConfigUrl;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }
            function activateBrands(ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.brandConfigUrl;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }
            function getBrands( page, pageSize, filter, showInactive, replaceRemoved, refresh) {
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

                return $http.get(cfg.brandConfigUrl, config).then(function (result) {
                    return result.data;
                });
            }
            function updateBrand(id, brand) {
                return $http.put(cfg.brandConfigUrl + "/" + id, brand).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();

