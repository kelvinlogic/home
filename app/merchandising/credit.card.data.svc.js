/**
 * Created by Kelvin on 11/26/2014.
 */
(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("creditCardSvc", creditCardSvcProvider);

    /* @ngInject */
    function creditCardSvcProvider() {
        // Available in config.
        var cfg = this;
        cfg.creditCardConfigUrl = null;
        cfg.$get = creditCardSvc;

        creditCardSvc.$inject = ["$http", "$q"];

        function creditCardSvc($http, $q) {
            return {
                createCreditCard: createCreditCard,
                activateCreditCards: activateCreditCards,
                deactivateCreditCards: deactivateCreditCards,
                getCreditCards: getCreditCards,
                updateCreditCard: updateCreditCard
            };
            /*
             * methods to perform server requests that interact with the
             * API
             */
            function createCreditCard(data) {
                var url = cfg.creditCardConfigUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }
            function deactivateCreditCards(ids) {
                // Ensure that the endpoint only gets arrays.
                console.log(ids)
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.creditCardConfigUrl;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }
            function activateCreditCards(ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.creditCardConfigUrl;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }
            function getCreditCards( page, pageSize, filter, showInactive, replaceRemoved, refresh) {
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

                return $http.get(cfg.creditCardConfigUrl, config).then(function (result) {
                    return result.data;
                });
            }
            function updateCreditCard(id, creditCard) {
                return $http.put(cfg.creditCardConfigUrl + "/" + id, creditCard).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();
