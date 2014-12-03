(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .provider("productDataSvc", productDataSvcProvider);

    /* @ngInject */
    function productDataSvcProvider() {
        // Available in config.
        var cfg = this;

        cfg.activateEndpoint = "activate";
        cfg.deactivateEndpoint = "deactivate";
        cfg.productsUrl = null;

        cfg.$get = productDataSvc;

        productDataSvc.$inject = ["$http"];

        function productDataSvc($http) {
            return {
                activateProducts: activateProducts,
                createProduct: createProduct,
                deactivateProducts: deactivateProducts,
                getProducts: getProducts,
                getProduct: getProduct,
                updateProduct: updateProduct
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function activateProducts(ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }

                var url = cfg.productsUrl + "/" + cfg.activateEndpoint;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function createProduct(data) {
                var url = cfg.productsUrl;
                return $http.post(url, data).then(function (result) {
                    return result.data;
                });
            }

            function deactivateProducts(ids) {
                // Ensure that the endpoint only gets arrays.
                if (!angular.isArray(ids)) {
                    ids = [ids];
                }


                var url = cfg.productsUrl + "/" + cfg.deactivateEndpoint;
                return $http.post(url, ids).then(function (result) {
                    return result.data;
                });
            }

            function getProducts(page, pageSize, filterOptions, showInactive, replaceRemoved, refresh) {
                if (!page) {
                    page = 1;
                }

                if (!pageSize) {
                    pageSize = 12;
                }

                var config = {
                    params: {
                        page: page,
                        pageSize: pageSize
                    }
                };

                if (filterOptions._search) {
                    config.params._search = filterOptions._search;

                    if (filterOptions.fields.length > 0) {
                        _.forEach(filterOptions.fields, function (field) {
                            config.params[field] = filterOptions.query;
                        });
                    } else {
                        config.params._all = filterOptions.query;
                    }
                }

                if (showInactive) {
                    if (showInactive) {
                        config.params.showInactive = showInactive;
                    }
                }

                if (replaceRemoved) {
                    if (replaceRemoved) {
                        config.params.replaceRemoved = replaceRemoved;
                    }
                }

                if (refresh) {
                    if (refresh) {
                        config.params.refresh = refresh;
                    }
                }

                var url = cfg.productsUrl;
                return $http.get(url, config).then(function (result) {
                    return result.data;
                });
            }

            function getProduct(id) {
                var url = cfg.productsUrl + "/" + id;

                return $http.get(url).then(function (result) {
                    return result.data;
                });
            }

            function updateProduct(id, productData) {
                var url = cfg.productsUrl + "/" + id;
                return $http.put(url, productData).then(function (result) {
                    return result.data;
                });
            }
        }
    }
})();