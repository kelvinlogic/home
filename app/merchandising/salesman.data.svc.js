/**
 * Created by njuguna on 11/27/2014.
 */
(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("salesmanDataSvc", salesmanDataSvcProvider);

    /* @ngInject */
    function salesmanDataSvcProvider() {
        // Available in config.
        var cfg = this;

        cfg.activateEndpoint = "activate";
        cfg.deactivateEndpoint = "deactivate";
        cfg.salesmanUrl = null;


        cfg.$get = salesmanDataSvc;

        salesmanDataSvc.$inject = ["$http", "$q"];

        function salesmanDataSvc($http, $q) {
            return {
                createSalesmanData: createSalesmanData,
                activateSalesmanData: activateSalesmanData,
                deactivateSalesmanData: deactivateSalesmanData,
                getSalesmanData: getSalesmanData,
                updateSalesmanData: updateSalesmanData
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function activateSalesmanData( ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.salesmanUrl+"/" + cfg.activateEndpoint;;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function createSalesmanData(data) {
                var url = cfg.salesmanUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }
            function deactivateSalesmanData(ids) {


                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }


                var url = cfg.salesmanUrl+"/" + cfg.deactivateEndpoint;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function getSalesmanData(page, pageSize, filter, showInactive, replaceRemoved, refresh) {

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

                var url = cfg.salesmanUrl;
                return $http.get(url, config).then(function (result) {
                    return result.data;
                });
            }

            function updateSalesmanData(id, salesmanData) {
                var url = cfg.salesmanUrl+ "/" + id;
                return $http.put(url, salesmanData).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();
