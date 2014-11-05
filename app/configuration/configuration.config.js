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
            templateUrl: 'common/header.tpl.html'
        };

        var leftNavView = {
            templateUrl: 'common/left.menu.tpl.html'
        };

        var footerView = {
            templateUrl: 'common/footer.tpl.html'
        };

        // Remove?
        $urlRouterProvider.otherwise('/language-config');

        $stateProvider.state('root', {
            abstract: true,
            url: '',
            views: {
                '': {
                    templateUrl: 'root.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('root.hierarchy-config', {
            url: '/hierarchy-config',
            templateUrl: 'configuration/hierarchy-config/hierarchy.config.tpl.html'
        });

        $stateProvider.state('root.language-config', {
            url: '/language-config',
            templateUrl: 'configuration/language-config/language.config.tpl.html'
        });

        $stateProvider.state('root.vertical-config', {
            url: '/vertical-config',
            templateUrl: 'configuration/vertical-config/vertical.config.tpl.html'
        });
    }

    function httpConfig($httpProvider) {
//        $httpProvider.interceptors.push("authInterceptor");
    }
})();