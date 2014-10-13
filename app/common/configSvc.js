(function () {
    "use strict";

    angular
        .module("fc.common")
        .factory("configSvc", configSvc);

    configSvc.$inject = ["$window"];

    /* @ngInject */
    function configSvc($window) {
        var defaultLocalConfig = {
            keyboardEnabled: false,
            keyboardVisible: true,
            languageCode: "en-US"
        };

        return {
            config: {
                hierarchy: {},
                language: {},
                vertical: {}
            },
            getLocalConfig: getLocalConfig,
            setLocalConfig: setLocalConfig
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
})();