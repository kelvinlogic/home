(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('LeftMenuCtrl', leftMenuCtrl);

    leftMenuCtrl.$inject = ['$scope', 'appConfig', 'authSvc', 'menuSvc'];

    /* @ngInject */
    function leftMenuCtrl($scope, config, authSvc, menuSvc) {
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
            $scope.$on(config.languageChanged, function (event, language) {
                load(language);
            });
        }

        function load(language) {
            vm.currentUser = authSvc.getCurrentUser();
            menuSvc.getMenuData('navbar').then(function (data) {
                vm.items = data;

            }, function () {
                vm.items = [];
            });
        }
    }
})();