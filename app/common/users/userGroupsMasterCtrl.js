(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('UserGroupsMasterCtrl', userGroupsMaster);

    userGroupsMaster.$inject = [];

    /* @ngInject */
    function userGroupsMaster() {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.gridOptions = {};
        vm.selectedUser = null;
        vm.titleKey = 'fc.common.groups.master.PAGE_TITLE';
        vm.groups = [];

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // TODO: Load user data here.
            vm.gridOptions.data = vm.groups;
            vm.gridOptions.enableScrollbars = false;

            // TODO: Add external filtering and sorting.
        }
    }
})();