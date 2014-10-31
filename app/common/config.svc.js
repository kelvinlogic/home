(function () {
    "use strict";

    angular
        .module("fc.common")
        .provider("configSvc", configSvcProvider);

    function configSvcProvider() {
        // Available in config.
        var cfg = this;
        cfg.configUrl = null;

        cfg.$get = configSvc;

        configSvc.$inject = ["$http", "$window"];

        /* @ngInject */
        function configSvc($http, $window) {
            var defaultLocalConfig = {
                keyboardEnabled: false,
                keyboardVisible: true,
                languageCode: "en-US"
            };

            return {
                getConfig: getConfig,
                getLocalConfig: getLocalConfig,
                setLocalConfig: setLocalConfig
            };

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function getConfig() {
                return $http.get(cfg.configUrl).then(function (result) {
                    return result.data;
                });
            }

            function getLocalConfig() {
                var config = null;
                if($window.localStorage.localConfig && typeof($window.localStorage.localConfig) === "string"){
                    config = JSON.parse($window.localStorage.localConfig);
                }

                return config || defaultLocalConfig;
            }

            function setLocalConfig(config) {
                $window.localStorage.localConfig = JSON.stringify(config);
            }
        }
    }
})();