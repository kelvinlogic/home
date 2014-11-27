(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("supplierDataSvc", supplierDataSvcProvider);

    /* @ngInject */
    function supplierDataSvcProvider() {
        // Available in config.
        var cfg = this;

        cfg.activateEndpoint = "activate";
        cfg.deactivateEndpoint = "deactivate";
        cfg.supplierUrl = null;


        cfg.$get = supplierDataSvc;

        supplierDataSvc.$inject = ["$http", "$q"];

        function supplierDataSvc($http, $q) {
            return {
                createSupplierData: createSupplierData,
                activateSuppliersData: activateSuppliersData,
                deactivateSuppliersData: deactivateSuppliersData,
                getSuppliersData: getSuppliersData,
                updateSupplierData: updateSupplierData
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function activateSuppliersData( ids) {
                     // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.supplierUrl+"/" + cfg.activateEndpoint;;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function createSupplierData(data) {
                var url = cfg.supplierUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }
            function deactivateSuppliersData(ids) {


                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }


                var url = cfg.supplierUrl+"/" + cfg.deactivateEndpoint;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function getSuppliersData(page, pageSize, filter, showInactive, replaceRemoved, refresh) {

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

                var url = cfg.supplierUrl;
                return $http.get(url, config).then(function (result) {
                    return result.data;
                });
            }

           function updateSupplierData(id, supplierData) {
                var url = cfg.supplierUrl+ "/" + id;
                return $http.put(url, supplierData).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();