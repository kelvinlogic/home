(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("currencyDataSvc", currencyDataSvcProvider);

    /* @ngInject */
    function currencyDataSvcProvider() {
        // Available in config.
        var me = this;
        me.currencyConfigUrl = null;
        me.$get = currencyDataSvc;

        currencyDataSvc.$inject = ["$http", "$q"];

        function currencyDataSvc($http, $q) {
            return {
                createCurrency: createCurrency,
                activateCurrencies: activateCurrencies,
                deactivateCurrencies: deactivateCurrencies,
                getCurrencies: getCurrencies,
                updateCurrency: updateCurrency
            };
            /*
            * methods to perform server requests that interact with the
            * API
            */
            function createCurrency(data) {
                var url = me.currencyConfigUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }
            function deactivateCurrencies(ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = me.currencyConfigUrl;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }
            function activateCurrencies(ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = me.currencyConfigUrl;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }
            function getCurrencies( page, pageSize, filter, showInactive, replaceRemoved, refresh) {
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

                return $http.get(me.currencyConfigUrl, config).then(function (result) {
                    return result.data;
                });
            }
            function updateCurrency(id, currency) {
                if(!id){
                    $q.reject("No item id");
                }
                return $http.put(me. currencyConfigUrl + "/" + id, currency).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();