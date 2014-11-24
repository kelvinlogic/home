(function () {
    'use strict';

    angular
        .module("fc.configuration")
        .provider("hierarchyConfigSvc", hierarchyConfigSvcProvider);

    /* @ngInject */
    function hierarchyConfigSvcProvider() {
        // Available in config.
        var cfg = this;

        cfg.activateEndpoint = "activate";
        cfg.deactivateEndpoint = "deactivate";
        cfg.hierarchyConfigUrl = null;
        cfg.hierarchyDataUrlTpl = null;

        cfg.$get = hierarchyConfigSvc;

        hierarchyConfigSvc.$inject = ["$http"];

        function hierarchyConfigSvc($http) {
            return {
                createHierarchyConfig: createHierarchyConfig,
                getHierarchyConfig: getHierarchyConfig
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function createHierarchyConfig(config) {
                var url = cfg.hierarchyConfigUrl;
                return $http.post(url, config).then(function (result) {
                    return result.data;
                });
            }

            function getHierarchyConfig() {
                var url = cfg.hierarchyConfigUrl;
                return $http.get(url).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();