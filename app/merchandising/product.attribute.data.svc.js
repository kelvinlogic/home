/**
 * Created by njuguna on 11/27/2014.
 */
(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("productAttrDataSvc", productAttrDataSvcProvider);

    /* @ngInject */
    function productAttrDataSvcProvider() {
        // Available in config.
        var cfg = this;

        cfg.activateEndpoint = "activate";
        cfg.deactivateEndpoint = "deactivate";
        cfg.productAttrUrl = null;

        cfg.$get = productAttrDataSvc;

        productAttrDataSvc.$inject = ["$http", "$q"];

        function productAttrDataSvc($http, $q) {
            return {
                createProductAttrData: createProductAttrData,
                activateProductAttrData: activateProductAttrData,
                deactivateProductAttrData: deactivateProductAttrData,
                getProductAttrData: getProductAttrData,
                updateProductAttrData: updateProductAttrData
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function activateProductAttrData( ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.productAttrUrl+"/" + cfg.activateEndpoint;;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function createProductAttrData(data) {
                var url = cfg.productAttrUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }
            function deactivateProductAttrData(ids) {


                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }


                var url = cfg.productAttrUrl+"/" + cfg.deactivateEndpoint;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function getProductAttrData(page, pageSize, filter, showInactive, replaceRemoved, refresh) {

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

                var url = cfg.productAttrUrl;
                return $http.get(url, config).then(function (result) {
                    return result.data;
                });
            }

            function updateProductAttrData(id, productAttr) {
                var url = cfg.productAttrUrl+ "/" + id;
                return $http.put(url, productAttr).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();
