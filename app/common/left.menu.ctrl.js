(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('LeftMenuCtrl', leftMenuCtrl);

    leftMenuCtrl.$inject = ['$rootScope', '$scope', 'appConfig', 'authSvc', 'menuSvc', 'reloadMenuEventValue'];

    /* @ngInject */
    function leftMenuCtrl($rootScope, $scope, config, authSvc, menuSvc, reloadMenuEventValue) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.currentUser = null;
        vm.items = [];

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Register an event listener for language changes.
            // This event helps us know what language is in use.
            $scope.$on(config.languageChanged, function () {
                load();
            });

            $rootScope.$on(reloadMenuEventValue, function () {
                load();
            })
        }

        function load() {
            vm.currentUser = authSvc.getCurrentUser();
            menuSvc.getMenuData('navbar').then(function (data) {
                vm.items = data;

            }, function () {
                vm.items = [];
            });
        }
    }
})();