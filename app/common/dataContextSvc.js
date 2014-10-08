(function () {
    'use strict';

    angular
        .module("fc.common")
        .provider("dataContextSvc", dataContextSvcProvider);

    /* @ngInject */
    function dataContextSvcProvider() {
        // Available in config.
        var cfg = this;
        cfg.configUrl = null;

        cfg.$get = dataContextSvc;

        dataContextSvc.$inject = ["$http", "configSvc"];

        function dataContextSvc($http, configSvc) {
            return {
                getConfig: getConfig
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function getConfig() {
                return $http.get(cfg.configUrl).then(function (result) {
                    configSvc.config = result.data;
                    return configSvc.config;
                });
            }
        }
    }
})();