/**
 * Created by njuguna on 11/26/2014.
 */
(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("vatDataSvc", vatDataSvcProvider);

    /* @ngInject */
    function vatDataSvcProvider() {
        // Available in config.
        var cfg = this;

        cfg.activateEndpoint = "activate";
        cfg.deactivateEndpoint = "deactivate";
        cfg.vatUrl = null;


        cfg.$get = vatDataSvc;

        vatDataSvc.$inject = ["$http", "$q"];

        function vatDataSvc($http, $q) {
            return {
                createVatData: createVatData,
                activateVatData: activateVatData,
                deactivateVatData: deactivateVatData,
                getVatData: getVatData,
                updateVatData: updateVatData
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function activateVatData( ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.vatUrl+"/" + cfg.activateEndpoint;;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function createVatData(data) {
                var url = cfg.vatUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }
            function deactivateVatData(ids) {


                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }


                var url = cfg.vatUrl+"/" + cfg.deactivateEndpoint;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function getVatData(page, pageSize, filter, showInactive, replaceRemoved, refresh) {

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

                var url = cfg.vatUrl;
                return $http.get(url, config).then(function (result) {
                    return result.data;
                });
            }

            function updateVatData(id, vatData) {
                var url = cfg.vatUrl+ "/" + id;
                return $http.put(url, vatData).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();


