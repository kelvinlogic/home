(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('SignOutCtrl', signOutCtrl);

    signOutCtrl.$inject = ['$window', 'appConfig', 'authSvc'];

    /* @ngInject */
    function signOutCtrl($window, config, authSvc) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.signOut = signOut;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
        }

        function signOut() {
            // Enter sign out logic here.
            authSvc.signOut().then(function () {
                $window.location = config.loginPage;
            }, function () {
                $window.location = config.loginPage;
            });
        }
    }
})();