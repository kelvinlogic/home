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

        cfg.$get = langSvc;

        langSvc.$inject = ['$http', "dataContextSvc"];

        function langSvc($http, dataContextSvc) {
            return {
                getActiveLanguages: getActiveLanguages,
                getLanguages: getLanguages
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function getActiveLanguages() {
                return dataContextSvc.getConfig().then(function (result) {
                    return result.language.languages;
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