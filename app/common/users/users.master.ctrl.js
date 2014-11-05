(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('UsersMasterCtrl', usersMaster);

    usersMaster.$inject = ['lodash', '$scope', 'DTOptionsBuilder'];

    /* @ngInject */
    function usersMaster(_, $scope, DTOptionsBuilder) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.filters = {};
        vm.gridOptions = {};
        vm.selectedUser = null;
        vm.selectedUsers = [];
        vm.titleKey = 'fc.common.users.master.PAGE_TITLE';
        vm.toggleSelection = toggleSelection;
        vm.users = [];

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            setupGrid();

            load();

            // TODO: Add external filtering and sorting.
        }

        function load() {
            // TODO: Load user data here.
            vm.users = [
                {id: 1, fullName: "Caleb Kiage", email: "ck@mail.com", mobile: "123456789"}
            ];

            $scope.$watchCollection(function () {
                return vm.filters;
            }, function (newCollection) {
                if (newCollection.all) {
                    // Search on all fields.
                }

                if (newCollection.id) {
                    // Search on id field.
                }

                if (newCollection.fullName) {
                    // Search on fullName field.
                }

                if (newCollection.email) {
                    // Search on email field.
                }

                if (newCollection.mobile) {
                    // Search on mobile field.
                }
            });
        }

        function setupGrid() {
            var sDom = "t"+
                "<'dt-toolbar-footer'<'col-sm-12 col-xs-12'i>>";

            vm.gridOptions = DTOptionsBuilder
                .newOptions()
                .withDOM(sDom)
                .withBootstrap()
                .withOption("paging", false)
                .withOption("autoWidth", true)
                .withOption('responsive', true);

            // TODO: Add external filtering and sorting.
        }

        function toggleSelection(item) {
            var index = vm.selectedUsers.indexOf(item);
            item.isSelected = !item.isSelected;

            if (item.isSelected) {
                vm.selectedUser = item;

                // If item isn't in the selected items array...
                if (index < 0) {
                    // add it.
                    vm.selectedUsers.push(item);
                }
            } else {
                // If item isn't in the selected items array...
                if (index > -1) {
                    // remove it.
                    vm.selectedUsers.splice(index, 1);
                }

                vm.selectedUser = _.last(vm.selectedUsers);
            }
        }
    }
})();