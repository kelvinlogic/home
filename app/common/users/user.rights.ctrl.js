(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('UserRightsCtrl', userRights);

    userRights.$inject = [];

    /* @ngInject */
    function userRights() {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.gridOptions = {};
        vm.rights = [];
        vm.selectedUser = null;
        vm.titleKey = 'fc.common.rights.PAGE_TITLE';

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // TODO: Load user data here.
            vm.gridOptions.data = vm.rights;
            vm.gridOptions.enableScrollbars = false;

            // TODO: Add external filtering and sorting.
        }
    }
})();