/**
 * Created by Caleb on 9/25/2014.
 */
(function () {
    angular.module('fc.merchandising').config([
        '$stateProvider',
        '$urlRouterProvider',
        routeConfig
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

        $urlRouterProvider.otherwise('/entity-master');

        $stateProvider.state('entity-master', {
            url: '/entity-master',
            views: {
                '': {
                    templateUrl: 'merchandising/org.hierarchy/entity-master.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });
    }
})();