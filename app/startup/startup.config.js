/**
 * Created by Caleb on 9/25/2014.
 */
(function () {
    angular.module('fc.startup').config([
        '$stateProvider',
        '$urlRouterProvider',
        routeConfig
    ]).config([
        '$translatePartialLoaderProvider',
        translationConfig
    ]).config([
        "$httpProvider",
        httpConfig
    ]);

    function routeConfig($stateProvider, $urlRouterProvider) {
        var topBarView = {
            templateUrl: 'common/header.html'
        };

        var leftNavView = {
            templateUrl: 'common/left-menu.html'
        };

        // Remove?
        $urlRouterProvider.otherwise('/language-config');

        $stateProvider.state('hierarchy-config', {
            url: '/hierarchy-config',
            views: {
                '': {
                    templateUrl: 'startup/hierarchy-config/hierarchy.config.html'
                },
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('language-config', {
            url: '/language-config',
            views: {
                '': {
                    templateUrl: 'startup/language-config/language.config.html'
                },
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('vertical-config', {
            url: '/vertical-config',
            views: {
                '': {
                    templateUrl: 'startup/vertical-config/vertical.config.html'
                },
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });
    }

    function translationConfig($translatePartialLoaderProvider) {
        $translatePartialLoaderProvider.addPart('startup');
    }

    function httpConfig($httpProvider) {
//        $httpProvider.interceptors.push("authInterceptor");
    }
})();