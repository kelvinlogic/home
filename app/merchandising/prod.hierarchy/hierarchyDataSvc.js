(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("hierarchyDataSvc", hierarchyDataSvcProvider);

    /* @ngInject */
    function hierarchyDataSvcProvider() {
        // Available in config.
        var cfg = this;
        cfg.hierarchyMappingUrl = null;

        cfg.$get = hierarchyDataSvc;

        hierarchyDataSvc.$inject = ["$http"];

        function hierarchyDataSvc($http) {
            return {
                getHierarchyMapping: getHierarchyMapping
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function getHierarchyMapping() {
                return $http.get(cfg.hierarchyMappingUrl).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();