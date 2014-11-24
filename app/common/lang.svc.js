(function () {
    'use strict';

    angular
        .module('fc.common')
        .provider('langSvc', langSvcProvider);

    /* @ngInject */
    function langSvcProvider() {
        // Available in config.
        var cfg = this;
        cfg.languagesUrl = null;
        cfg.languageConfigUrl = null;

        cfg.$get = langSvc;

        langSvc.$inject = ['$http'];

        function langSvc($http) {
            return {
                getActiveLanguages: getActiveLanguages,
                getLanguages: getLanguages
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function getActiveLanguages() {
                return $http.get(cfg.languageConfigUrl).then(function (result) {
                    return result.data;
                });
            }

            function getLanguages() {
                return $http.get(cfg.languagesUrl).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();