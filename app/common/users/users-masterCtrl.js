(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('UsersMasterCtrl', usersMaster);

    usersMaster.$inject = [];

    /* @ngInject */
    function usersMaster() {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.gridOptions = {};
        vm.selectedUser = null;
        vm.titleKey = 'fc.common.users.master.PAGE_TITLE';
        vm.users = [];

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // TODO: Load user data here.
            vm.gridOptions.data = vm.users;
            vm.gridOptions.enableScrollbars = false;

            // TODO: Add external filtering and sorting.
        }
    }
})();