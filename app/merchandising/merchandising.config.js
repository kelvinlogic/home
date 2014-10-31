/**
 * Created by Caleb on 9/25/2014.
 */
(function () {
    angular.module('fc.merchandising').config([
        '$stateProvider',
        '$urlRouterProvider',
        routeConfig
    ]).config([
        "hierarchyDataSvcProvider",
        svcConfig
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

        $urlRouterProvider.otherwise('/entity-master');

        $stateProvider.state('entity-master', {
            url: '/entity-master',
            views: {
                '': {
                    templateUrl: 'merchandising/org.hierarchy/entity.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('hierarchy-master', {
            url: '/hierarchy-master',
            views: {
                '': {
                    templateUrl: 'merchandising/org.hierarchy/hierarchy.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('branch-master', {
            url: '/branch-master',
            views: {
                '': {
                    templateUrl: 'merchandising/org.hierarchy/branch.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('sub-branch-master', {
            url: '/sub-branch-master',
            views: {
                '': {
                    templateUrl: 'merchandising/org.hierarchy/sub.branch.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('vat-master', {
            url: '/vat-master',
            views: {
                '': {
                    templateUrl: 'merchandising/vat.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('supplier-master', {
            url: '/supplier-master',
            views: {
                '': {
                    templateUrl: 'merchandising/supplier.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('uom-master', {
            url: '/uom-master',
            views: {
                '': {
                    templateUrl: 'merchandising/uom.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('serving-uom-master', {
            url: '/serving-uom-master',
            views: {
                '': {
                    templateUrl: 'merchandising/serving.uom.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('product-attributes-master', {
            url: '/product-attributes-master',
            views: {
                '': {
                    templateUrl: 'merchandising/product.attributes.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('product-hierarchy-master', {
            url: '/product-hierarchy-master?id',
            views: {
                '': {
                    templateUrl: 'merchandising/prod.hierarchy/product.hierarchy.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('currencies-master', {
            url: '/currencies-master',
            views: {
                '': {
                    templateUrl: 'merchandising/currencies.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('instructions-master', {
            url: '/instructions-master',
            views: {
                '': {
                    templateUrl: 'merchandising/instructions.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('reasons-master', {
            url: '/reasons-master',
            views: {
                '': {
                    templateUrl: 'merchandising/reasons.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('salesman-master', {
            url: '/salesman-master',
            views: {
                '': {
                    templateUrl: 'merchandising/salesman.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('credit-card-master', {
            url: '/credit-card-master',
            views: {
                '': {
                    templateUrl: 'merchandising/credit.card.master.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('product-hierarchy-mapping', {
            url: '/product-hierarchy-mapping?id',
            views: {
                '': {
                    templateUrl: 'merchandising/prod.hierarchy/product.hierarchy.mapping.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });
    }

    function svcConfig(hierarchyDataSvcProvider) {
        hierarchyDataSvcProvider.hierarchyMappingUrl = null;
    }
})();