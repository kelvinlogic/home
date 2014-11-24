/**
 * Created by Caleb on 9/18/2014.
 */
"use strict";

(function () {
    angular.module('fc.common').provider('menuSvc', menuSvcProvider);

    function menuSvcProvider() {
        // Available in config.
        var cfg = this;
        cfg.menuUrlPrefix = null;
        cfg.getMenuUrl = function (name) {
            return cfg.menuUrlPrefix + '/' + name;
        };

        cfg.$get = menuSvc;

        menuSvc.$inject = ['$http'];

        function menuSvc($http) {
            return {
                getMenuData: getMenuData
            };

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function getMenuData(name) {
                var menuUrl = cfg.getMenuUrl(name);
                return $http.get(menuUrl).then(function (res) {
                    return res.data;
                });
            }
        }
    }
})();