/**
 * Created by njuguna on 11/26/2014.
 */
(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("servingDataSvc", servingDataSvcProvider);

    /* @ngInject */
    function servingDataSvcProvider() {
        // Available in config.
        var cfg = this;

        cfg.activateEndpoint = "activate";
        cfg.deactivateEndpoint = "deactivate";
        cfg.servingUrl = null;


        cfg.$get = servingDataSvc;

        servingDataSvc.$inject = ["$http", "$q"];

        function servingDataSvc($http, $q) {
            return {
                createServingData: createServingData,
                activateServingData: activateServingData,
                deactivateServingData: deactivateServingData,
                getServingData: getServingData,
                updateServingData: updateServingData
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function activateServingData( ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.servingUrl+"/" + cfg.activateEndpoint;;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function createServingData(data) {
                var url = cfg.servingUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }
            function deactivateServingData(ids) {


                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }


                var url = cfg.servingUrl+"/" + cfg.deactivateEndpoint;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function getServingData(page, pageSize, filter, showInactive, replaceRemoved, refresh) {

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

                var url = cfg.servingUrl;
                return $http.get(url, config).then(function (result) {
                    return result.data;
                });
            }

            function updateServingData(id, servingData) {
                var url = cfg.servingUrl+ "/" + id;
                return $http.put(url, servingData).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();
