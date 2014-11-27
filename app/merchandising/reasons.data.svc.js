/**
 * Created by njuguna on 11/26/2014.
 */
(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("reasonDataSvc", reasonDataSvcProvider);

    /* @ngInject */
    function reasonDataSvcProvider() {
        // Available in config.
        var cfg = this;

        cfg.activateEndpoint = "activate";
        cfg.deactivateEndpoint = "deactivate";
        cfg.reasonUrl = null;


        cfg.$get = reasonDataSvc;

        reasonDataSvc.$inject = ["$http", "$q"];

        function reasonDataSvc($http, $q) {
            return {
                createReasonData: createReasonData,
                activateReasonData: activateReasonData,
                deactivateReasonData: deactivateReasonData,
                getReasonData: getReasonData,
                updateReasonData: updateReasonData
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function activateReasonData( ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.reasonUrl+"/" + cfg.activateEndpoint;;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function createReasonData(data) {
                var url = cfg.reasonUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }
            function deactivateReasonData(ids) {


                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }


                var url = cfg.reasonUrl+"/" + cfg.deactivateEndpoint;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function getReasonData(page, pageSize, filter, showInactive, replaceRemoved, refresh) {

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

                var url = cfg.reasonUrl;
                return $http.get(url, config).then(function (result) {
                    return result.data;
                });
            }

            function updateReasonData(id, reasonData) {
                var url = cfg.reasonUrl+ "/" + id;
                return $http.put(url, reasonData).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();

