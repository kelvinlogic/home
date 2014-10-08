/**
 * Created by Caleb on 9/25/2014.
 */
(function () {
    angular.module('fc.login').config([
        '$stateProvider',
        '$urlRouterProvider',
        routeConfig
    ]);

    function routeConfig($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider.state('login', {
            url: '/?returnUrl',
            views: {
                '': {
                    templateUrl: 'login/login.html'
                },
                'top-bar': {
                    templateUrl: 'common/header.html'
                }
            }
        });
    }
})();