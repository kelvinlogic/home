(function () {
    "use strict";

    angular
        .module("fc.common")
        .config(config)
        .run(run);

    config.$inject = [
        "$httpProvider",
        "authSvcProvider",
        "configSvcProvider",
        "langSvcProvider",
        "menuSvcProvider",
        "searchSvcProvider"
    ];
    run.$inject = ["$rootScope", "authSvc"];

    function config($httpProvider, authSvcProvider, configSvcProvider, langSvcProvider, menuSvcProvider, searchSvcProvider) {
        $httpProvider.interceptors.push('authInterceptor');
        $httpProvider.interceptors.push('languageInterceptor');

        authSvcProvider.loginUrl = "data/login.json";
        authSvcProvider.signOutUrl = "data/login.json";

        configSvcProvider.configUrl = "data/config.json";

        langSvcProvider.languagesUrl = "data/languages.json";
        langSvcProvider.languageConfigUrl = "data/language.config.json";

        menuSvcProvider.menuUrlPrefix = "api/menu";

        searchSvcProvider.searchUrl = "search";
    }

    function run($rootScope, authSvc) {
        $rootScope.isLoggedIn = authSvc.isLoggedIn;
    }
})();