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
    ]).constant("merchandisingConstants", buildMerchandisingConstants());

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

        $stateProvider.state('root', {
            abstract: true,
            url: '',
            views: {
                '': {
                    templateUrl: 'common/root.tpl.html'
                },
                'footer': footerView,
                'left-nav': leftNavView,
                'top-bar': topBarView
            }
        });

        $stateProvider.state('root.entity-master', {
            url: '/entity-master',
            templateUrl: 'merchandising/org.hierarchy/entity.master.tpl.html'
        });

        $stateProvider.state('root.hierarchy-master', {
            url: '/hierarchy-master',
            templateUrl: 'merchandising/org.hierarchy/hierarchy.master.tpl.html'
        });

        $stateProvider.state('root.branch-master', {
            url: '/branch-master',
            templateUrl: 'merchandising/org.hierarchy/branch.master.tpl.html'
        });

        $stateProvider.state('root.sub-branch-master', {
            url: '/sub-branch-master',
            templateUrl: 'merchandising/org.hierarchy/sub.branch.master.tpl.html'
        });

        $stateProvider.state('root.vat-master', {
            url: '/vat-master',
            templateUrl: 'merchandising/vat.master.tpl.html'
        });

        $stateProvider.state('root.supplier-master', {
            url: '/supplier-master',
            templateUrl: 'merchandising/supplier.master.tpl.html'
        });

        $stateProvider.state('root.uom-master', {
            url: '/uom-master',
            templateUrl: 'merchandising/uom.master.tpl.html'
        });

        $stateProvider.state('root.serving-uom-master', {
            url: '/serving-uom-master',
            templateUrl: 'merchandising/serving.uom.master.tpl.html'
        });

        $stateProvider.state('root.product-attributes-master', {
            url: '/product-attributes-master',
            templateUrl: 'merchandising/product.attributes.master.tpl.html'
        });

        $stateProvider.state('root.product-hierarchy-master', {
            url: '/product-hierarchy-master?id',
            templateUrl: 'merchandising/prod.hierarchy/product.hierarchy.master.tpl.html'
        });

        $stateProvider.state('root.currencies-master', {
            url: '/currencies-master',
            templateUrl: 'merchandising/currencies.master.tpl.html'
        });

        $stateProvider.state('root.instructions-master', {
            url: '/instructions-master',
            templateUrl: 'merchandising/instructions.master.tpl.html'
        });

        $stateProvider.state('root.reasons-master', {
            url: '/reasons-master',
            templateUrl: 'merchandising/reasons.master.tpl.html'
        });

        $stateProvider.state('root.salesman-master', {
            url: '/salesman-master',
            templateUrl: 'merchandising/salesman.master.tpl.html'
        });

        $stateProvider.state('root.credit-card-master', {
            url: '/credit-card-master',
            templateUrl: 'merchandising/credit.card.master.tpl.html'
        });

        $stateProvider.state('root.product-hierarchy-mapping', {
            url: '/product-hierarchy-mapping?id',
            templateUrl: 'merchandising/prod.hierarchy/product.hierarchy.mapping.tpl.html'
        });

        $stateProvider.state('root.product-brand-master', {
            url: '/product-brand-master',
            templateUrl: 'merchandising/product.brand.master.tpl.html'
        });

        $stateProvider.state('root.scan-code-master', {
            url: '/scan-code-master',
            templateUrl: 'merchandising/scan.code.master.tpl.html'
        });

        $stateProvider.state('root.product-positioning-master', {
            url: '/product-positioning-master',
            templateUrl: 'merchandising/product.positioning.master.tpl.html'
        });

        $stateProvider.state('root.supplier-product-mapping', {
            url: '/supplier-product-mapping',
            templateUrl: 'merchandising/mappings/supplier.product.mapping.tpl.html'
        });
    }

    function svcConfig(hierarchyDataSvcProvider) {
        hierarchyDataSvcProvider.hierarchyMappingUrl = null;
    }

    function buildMerchandisingConstants() {
        return {
            suggestions: {
                products: {
                    displayKey: "name",
                    remote: {
                        url: "data/products.json?q=%QUERY",
                        wildcard: "%QUERY"
                    },
                    templates: {
                        suggestion: function (suggestion) {
                            var html = "<div class='fc-compound-suggestion'>";
                            html += "<div class='fc-compound-main'>" + suggestion["name"] + "</div>";
                            if (suggestion["code"]) {
                                html += "<span class='fc-compound-hint text-muted'>" + suggestion["code"] + "</span>";
                            }

                            html += "</div>";
                            return html;
                        }
                    }
                },
                suppliers: {
                    displayKey: "name",
                    remote: {
                        url: "data/suppliers.json?q=%QUERY",
                        wildcard: "%QUERY"
                    },
                    templates: {
                        suggestion: function (suggestion) {
                            var html = "<div class='fc-compound-suggestion'>";
                            html += "<div class='fc-compound-main'>" + suggestion["name"] + "</div>";
                            if (suggestion["code"]) {
                                html += "<span class='fc-compound-hint text-muted'>" + suggestion["code"] + "</span>";
                            }

                            html += "</div>";
                            return html;
                        }
                    }
                }
            }
        }
    }
})();