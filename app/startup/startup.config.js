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
        // Remove?
        $urlRouterProvider.otherwise('/language-config');

        $stateProvider.state('hierarchy-config', {
            url: '/hierarchy-config',
            views: {
                '': {
                    templateUrl: 'startup/hierarchy-config/hierarchy.config.html'
                },
                'left-nav': {
                    templateUrl: 'common/left-menu.html'
                },
                'top-bar': {
                    templateUrl: 'common/header.html'
                }
            }
        });

        $stateProvider.state('language-config', {
            url: '/language-config',
            views: {
                '': {
                    templateUrl: 'startup/language-config/language.config.html'
                },
                'left-nav': {
                    templateUrl: 'common/left-menu.html'
                },
                'top-bar': {
                    templateUrl: 'common/header.html'
                }
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