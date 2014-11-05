(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('UserGroupsMasterCtrl', userGroupsMaster);

    userGroupsMaster.$inject = ['lodash', '$scope', 'DTOptionsBuilder'];

    /* @ngInject */
    function userGroupsMaster(_, $scope, DTOptionsBuilder) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.filters = {};
        vm.gridOptions = {};
        vm.groups = [];
        vm.selectedGroup = null;
        vm.selectedGroups = [];
        vm.titleKey = 'fc.common.groups.master.PAGE_TITLE';
        vm.toggleSelection = toggleSelection;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            setupGrid();

            load();

            // TODO: Add external filtering and sorting.
        }

        function load() {
            // TODO: Load user data here.
            vm.groups = [
                {id: 1, name: "Group"}
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

                if (newCollection.name) {
                    // Search on name field.
                }

                if (newCollection.description) {
                    // Search on description field.
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
            var index = vm.selectedGroups.indexOf(item);
            item.isSelected = !item.isSelected;

            if (item.isSelected) {
                vm.selectedGroup = item;

                // If item isn't in the selected items array...
                if (index < 0) {
                    // add it.
                    vm.selectedGroups.push(item);
                }
            } else {
                // If item isn't in the selected items array...
                if (index > -1) {
                    // remove it.
                    vm.selectedGroups.splice(index, 1);
                }

                vm.selectedGroup = _.last(vm.selectedGroups);
            }
        }
    }
})();