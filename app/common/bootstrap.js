(function () {
    "use strict";

    angular
        .module("fc.common")
        .config(config)
        .run(run);

    config.$inject = ["authSvcProvider", "dataContextSvcProvider", "langSvcProvider", "menuSvcProvider"];
    run.$inject = ["$rootScope", "authSvc"];

    function config(authSvcProvider, dataContextSvcProvider, langSvcProvider, menuSvcProvider) {
        authSvcProvider.loginUrl = "data/login.json";
        authSvcProvider.signOutUrl = "data/login.json";

        dataContextSvcProvider.configUrl = "data/config.json";

        langSvcProvider.languagesUrl = "data/languages.json";

        menuSvcProvider.menuUrlPrefix = "data";
        menuSvcProvider.menuUrlSuffix = ".menu.json";
    }

    function run($rootScope, authSvc) {
        $rootScope.isLoggedIn = authSvc.isLoggedIn;

        // For Debugging angular-translate.
//        $rootScope.$on('$translatePartialLoaderStructureChanged', function (event, a) {
//            console.log('$translatePartialLoaderStructureChanged', a);
//            $translate.refresh().then(function () {
//                console.log('refresh due to $translatePartialLoaderStructureChanged DONE');
//            });
//        });
//
//        $rootScope.$on('$translateChangeStart', function (event, a) {
//            console.log('$translateChangeStart', a);
//        });
//        $rootScope.$on('$translateChangeSuccess', function (event, a) {
//            console.log('$translateChangeSuccess', a);
//        });
//        $rootScope.$on('$translateChangeError', function (event, a) {
//            console.log('$translateChangeError', a);
//        });
//        $rootScope.$on('$translateLoadingStart', function (event, a) {
//            console.log('$translateLoadingStart', a);
//        });
//        $rootScope.$on('$translateLoadingStart', function (event, a) {
//            console.log('$translateLoadingStart', a);
//        });
//        $rootScope.$on('$translateLoadingSuccess', function (event, a) {
//            console.log('$translateLoadingSuccess', a);
//        });
//        $rootScope.$on('$translateLoadingError', function (event, a) {
//            console.log('$translateLoadingError', a);
//        });
    }
})();