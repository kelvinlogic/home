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
        var me = this;
        me.brandConfigUrl = null;
        me.$get = brandDataSvc;

        brandDataSvc.$inject = ["$http", "$q"];

        function brandDataSvc($http, $q) {
            return {
                createBrand: createBrand,
                activateBrands: activateBrands,
                deactivateBrands: deactivateBrands,
                getBrands: getBrands,
                updateBrand: updateBrand
            };
            /*
             * methods to perform server requests that interact with the
             * API
             */
            function createBrand(data) {
                var url = me.brandConfigUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }
            function deactivateBrands(ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = me.brandConfigUrl;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }
            function activateBrands(ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = me.brandConfigUrl;
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
                if (refresh) {
                    if (refresh) {
                        config.params.refresh = refresh;
                    }
                }

                return $http.get(me.brandConfigUrl, config).then(function (result) {
                    return result.data;
                });
            }
            function updateBrand(id, brand) {
                if(!id){
                    $q.reject("No item id");
                }
                return $http.put(me.brandConfigUrl + "/" + id, brand).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();

