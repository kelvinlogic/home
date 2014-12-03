/**
 * Created by kelvin on 3/12/2014.
 */
(function () {
    angular.module('fc.login').config([
        '$stateProvider',
        '$urlRouterProvider',
        routeConfig
    ]).config([
        "authSvcProvider",
        svcConfig
    ]);

    function routeConfig($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider.state('login', {
            url: '/?returnUrl',
            views: {
                '': {
                    templateUrl: 'login/login.tpl.html'
                },
                'top-bar': {
                    templateUrl: 'common/header.tpl.html'
                }
            }
        });
    }
    function svcConfig(loginSvcProvider){
        loginSvcProvider.loginUrl = "api/login";

    };
})();