/**
 * Created by Caleb on 9/25/2014.
 */
(function () {
    angular.module('fc.configuration').config([
        '$stateProvider',
        '$urlRouterProvider',
        routeConfig
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

        var footerView = {
            templateUrl: 'common/footer.html'
        };

        // Remove?
        $urlRouterProvider.otherwise('/language-config');

        $stateProvider.state('hierarchy-config', {
            url: '/hierarchy-config',
            views: {
                '': {
                    templateUrl: 'configuration/hierarchy-config/hierarchy.config.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('language-config', {
            url: '/language-config',
            views: {
                '': {
                    templateUrl: 'configuration/language-config/language.config.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('vertical-config', {
            url: '/vertical-config',
            views: {
                '': {
                    templateUrl: 'configuration/vertical-config/vertical.config.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });
    }

    function httpConfig($httpProvider) {
//        $httpProvider.interceptors.push("authInterceptor");
    }
})();