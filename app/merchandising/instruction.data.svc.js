/**
 * Created by Kelvin on 11/26/2014.
 */
(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("instructionDataSvc", instructionDataSvcProvider);

    /* @ngInject */
    function instructionDataSvcProvider() {
        // Available in config.
        var cfg = this;
        cfg.instructionConfigUrl = null;
        cfg.$get = instructionDataSvc;

        instructionDataSvc.$inject = ["$http", "$q"];

        function instructionDataSvc($http, $q) {
            return {
                createInstruction: createInstruction,
                activateInstructions: activateInstructions,
                deactivateInstructions: deactivateInstructions,
                getInstructions: getInstructions,
                updateInstruction: updateInstruction,
                searchFilter:searchFilter
            };
            /*
             * methods to perform server requests that interact with the
             * API
             */
            function createInstruction(data) {
                var url = cfg.instructionConfigUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }
            function searchFilter(data){
                console.log(data);
                var url = cfg.instructionConfigUrl;
                return $http.get(url, data).then(function (result) {
                    return result.data;
                });
            }
            function deactivateInstructions(ids) {
                // Ensure that the endpoint only gets arrays.
                console.log(ids)
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.instructionConfigUrl;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }
            function activateInstructions(ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.instructionConfigUrl;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }
            function getInstructions( page, pageSize, filter, showInactive, replaceRemoved, refresh) {
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

                return $http.get(cfg.instructionConfigUrl, config).then(function (result) {
                    return result.data;
                });
            }
            function updateInstruction(id, instruction) {
                return $http.put(cfg.instructionConfigUrl + "/" + id, instruction).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();
