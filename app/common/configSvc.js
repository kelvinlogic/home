(function () {
    "use strict";

    angular
        .module("fc.common")
        .factory("configSvc", configSvc);

    configSvc.$inject = [];

    /* @ngInject */
    function configSvc() {
        var service = {
            config: {
                hierarchy: {},
                language: {}
            }
        };

        return service;

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }
})();